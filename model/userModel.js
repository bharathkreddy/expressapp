const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, "User name required"] },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: (props) => `${props.value} is not a valid email!`,
    },

    // validate: {
    //     validator: function (v) {
    //       // return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
    //     },
    //     message: (props) => `${props.value} is not a valid email!`,
    //   },

    required: [true, "User email required"],
    unique: true,
    lowercase: true,
  },
  photo: String,
  password: { type: String, required: true, minlength: 5 },
  passwordConfirm: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
