const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const appError = require("./../utils/appError");
const { receiveMessageOnPort } = require("worker_threads");
const sendEmail = require("../utils/email");
const crypto = require("node:crypto");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const catchAsynch = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

exports.signup = catchAsynch(async (req, res) => {
  // const newUser = await User.create(req.body); We dont do this because user can add arbitary keys in body which we dont want.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  // generate jwt
  const token = signToken(newUser._id);
  res.status(201).json({ status: "success", token: token, data: newUser });
});

exports.login = catchAsynch(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) check if email and passwords exist
  if (!email || !password) {
    // return as we want the function to end after passing error to next() if not then below res.status at end also runs and sets headers which error out as appError also sends res and sets headers.
    return next(new appError("Please provide email and password", 400));
  }
  // 2) Check if user exists && password is correct.
  // we need to do .select to add password field which is hidden default due to property set in the userModel.js.
  const user = await User.findOne({ email: email }).select("+password");
  // we have implemented static method on userSchema , since user is a document off the model created on the userSchema - this static method should be available to this user.

  // const correct = await user.correctPassword(password, user.password);

  // we cant use above as if we have  no user then we we are calling password check on a null return so we do below
  if (!user || !(await user.correctPassword(password, user.password))) {
    // we should never give any information if its email missing or password which is wrong so check them together.
    return next(new appError("Please provide correct email and Password", 401));
  }
  // 3) if all ok, send jwt token to client.
  const token = signToken(user._id);
  res.status(201).json({ status: "success", token: token });
});

exports.protect = catchAsynch(async (req, res, next) => {
  // 1) Check for token.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new appError("You are not logged in. Please log in to get Access.", 401)
    );
  }

  // 2) Verification of token.
  // use promicify in utils to promisify jwt.verify (which natively takes a call back function.) and call it immediately and await the result.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists - what if user has been removed after JWT was issued.
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new appError("user for this token no longer exists.", 401));
  }

  // 4) Check if user changed password after JWT issue (users might have done that because JWT was stolen.)
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new appError("user changed password. Please login again.", 401)
    );
  }

  // 5) grant access
  req.user = freshUser;
  next();
});

// we need to pass args to the middleware so we create a wrapper which creates a closure.
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user was set set by previous middleware (see above function) and thats how we get access to user.
    if (!roles.includes(req.user.role)) {
      return next(
        new appError("You do not have permissions to this operation.", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsynch(async (req, res, next) => {
  // 1) find the user
  const user = await User.findOne(req.body).exec();

  if (!user) {
    return next(new appError("Email Id does not exists", 403));
  }

  // 2) create a reset token for the user
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false }); // we are saving the document but do not want to provide all mandatory fields, so de-activate all mandatory fields.

  // 3) send email to the user with reset token
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const transporter = sendEmail(resetURL);

  // we want to do more than just passing the error to global error middleware
  try {
    await transporter.sendMail({
      from: '"quentin borer 👻" <quentin.borer@ethereal.email>', // sender address
      to: `${req.body.email}`, // list of receivers
      subject: "Password reset request.", // Subject line
      text: `Please change your password before - ${user.passwordResetExpires}`, // plain text body
      html: `<p>Please change your password before - ${user.passwordResetExpires}</p><b>ResetURL: ${resetURL}</b>`, // html body
    });

    res.status(200).json({
      status: "success",
      message: "Please check your email for password reset link.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new appError(
        "There was an error sending email. Please try again in a few..",
        500
      )
    );
  }
});

exports.resetPassword = catchAsynch(async (req, res, next) => {
  // 1) fetch the user based on token only - since this is a link based request and user wont send email as body/payload to this endpoint

  const token_hash = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: token_hash,
    passwordResetExpires: { $gte: Date.now() },
  }).exec();

  // 2) If reset-token matches & is not expired - change the password
  if (!user) {
    return next(
      new appError("Token Expired, please reset the password again.", 400)
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // save not update because we want all validators to kick in - Here is where password = passwordConfirm validation will kick in so not required to do it here.
  await user.save();

  // 3) update the passwordChangedAt property for the user

  // 4) Log the user in by sending the JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token: token,
  });
});
