const User = require("./../model/userModel");
const APIFeatures = require("./../utils/apiFeatures");
const appError = require("./../utils/appError");
const jwt = require("jsonwebtoken");

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
