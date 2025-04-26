const User = require("../model/userModel");

const catchAsynch = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
exports.signup = catchAsynch(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ status: "success", data: user });
});
