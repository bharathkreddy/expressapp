const nodemailer = require("nodemailer");

function sendEmail(resetURL) {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "quentin.borer@ethereal.email",
      pass: "jt9M6c9WpFxWD2wUvv",
    },
  });

  return transporter;
}

module.exports = sendEmail;
