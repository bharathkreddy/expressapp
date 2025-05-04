const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "User name required"] },
    email: {
      type: String,
      validate: {
        validator: validator.isEmail,
        message: (props) => `${props.value} is not a valid email!`,
      },
      required: [true, "User email required"],
      unique: true,
      lowercase: true,
    },
    photo: String,
    password: { type: String, required: true, minlength: 5, select: false },
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
    passwordChangedAt: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin", "guide", "lead-guide"],
      default: "user",
      required: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    methods: {
      async correctPassword(candidatePassword, userPassword) {
        return await bcrypt.compare(candidatePassword, userPassword);
      },

      changedPasswordAfter(JWTimestamp) {
        if (!this.passwordChangedAt) return false;

        const changedTimestamp = parseInt(
          this.passwordChangedAt.getTime() / 1000,
          10
        );
        return JWTimestamp < changedTimestamp;
      },

      createPasswordResetToken() {
        const resetToken = crypto.randomBytes(32).toString("hex");
        this.passwordResetToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");
        this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 mins in milliseconds
        return resetToken;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  // only run if password was modified, user might be just changing email which also fire save- hook.
  if (!this.isModified("password")) return next();
  const saltingRounds = 10;
  this.password = await bcrypt.hash(this.password, saltingRounds);

  //update the passworedChangedAt property to now.
  this.passwordChangedAt = Date.now();

  // delete passwordConfirm field - as we dont need this beyond just ensuring is user has typed the password correctly
  this.passwordConfirm = undefined;
  next();
});

// this is another way to create static methods.

// userSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

const User = mongoose.model("User", userSchema);

module.exports = User;
