const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const appError = require("../utils/appError");

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
    return next(new appError("Please provide both email and Password", 400));
  }
  // 2) Check if user exists && password is correct.
  // we need to do .select to add password field which is hidden default due to property set in the userModel.js.
  const user = await User.findOne({ email: email }).select("+password");
  // we have implemented static method on userSchema , since user is a document off the model created on the userSchema - this static method should be available to this user.
  const correct = await user.correctPassword(password, user.password);

  // we should never give any information if its email missing or password which is wrong so check them together.
  if (!user || !correct) {
    return next(new appError("Please provide correct email and Password", 401));
  }
  // 3) if all ok, send jwt token to client.
  const token = signToken(user._id);
  res.status(201).json({ status: "success", token: token });
});
