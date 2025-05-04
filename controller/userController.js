const User = require("./../model/userModel");
const APIFeatures = require("./../utils/apiFeatures");
const AppError = require("./../utils/appError");
const appError = require("./../utils/appError");
const jwt = require("jsonwebtoken");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const catchAsynch = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

exports.getAllUser = catchAsynch(async (req, res) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .project()
    .paginate()
    .sort();
  const users = await features.query;
  res
    .status(200)
    .json({ status: "success", length: users.length, data: users });
});

exports.getUser = catchAsynch(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(
      new appError(`can't find on server, user with id - ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ status: "success", data: user });
});

exports.AddUser = catchAsynch(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ status: "success", data: user });
});

exports.deleteUser = catchAsynch(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new appError(`can't find on server, user with id - ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ status: "success" });
});

exports.modifyUser = catchAsynch(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  if (!user) {
    return next(
      new appError(`can't find on server, user with id - ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "Success",
    data: user,
  });
});

exports.updateMe = catchAsynch(async (req, res, next) => {
  // 1) Check if update is for password or this is new document creation.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new appError(
        "This route is not for password updates, Please use /resetPassword",
        400
      )
    );
  }

  // 2) Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

exports.deleteMe = catchAsynch(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: "success", data: null });
});
