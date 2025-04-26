const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      // works only with create and save NOT with patch updates.
      validator: function (v) {
        // cant use arrow function as we need THIS object.
        return v === this.password;
      },
      message: (props) => `${props.value} does not match the password`,
    },
  },
});

userSchema.pre("save", async function (next) {
  // only run if password was modified, user might be just changing email which also fire save- hook.
  if (!this.isModified("password")) return next();
  const saltingRounds = 10;
  this.password = await bcrypt.hash(this.password, saltingRounds);

  // delete passwordConfirm field - as we dont need this beyond just ensuring is user has typed the password correctly
  this.passwordConfirm = undefined;
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
