const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

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
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(201).json({ status: "success", token: token, data: newUser });
});
