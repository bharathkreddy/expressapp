const AppError = require("../utils/appError");

// we want to turn mongoose error into an operational error
const handleCastErrorDB = (err) => {
  const message = `CAST ERROR: Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400); //400 for a bad request.
};

const handleDuplicateKeyErrorDB = (err) => {
  const message = `Duplicate key: ${err.keyValue.name}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = `Validation Error: ${err.message}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  // console.log("🔥 Error::", err);
  console.log(err.name);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    time: err.occueredAt,
    isOperational: err.isOperational,
    stack: err.stack,
    fullerror: err,
  });
};

const sendErrorProd = (err, res) => {
  // Operational trusted errors: send message to client
  if (err.isOperational) {
    console.error("🔥 Error::", err);
    console.error("🔥 ErrorStack::", err.stack);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      time: err.occueredAt,
      isOperational: err.isOperational,
    });

    // Programming or other unknown errors: Don't leak error details.
  } else {
    // 1. Log error
    console.error("🔥 Error::", err);

    // 2. Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong, please contact bharathkreddy",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.occueredAt = new Date().toISOString();

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err }; //make a copy of err, so as not to modify original err.
    if (err.name === "CastError") error = handleCastErrorDB(err); //mongoose generated error when wrong id is provided for finding a tour. run in dev mode to see this on postman
    if (err.code === 11000) error = handleDuplicateKeyErrorDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    sendErrorProd(error, res); //send the modified error now. if its not a CastError - it wont be modified.
  }
};
