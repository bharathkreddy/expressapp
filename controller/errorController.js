module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.isOperational = err.isOperational || false;
  err.occueredAt = new Date().toISOString();
  console.log(
    `🔥 Error::@-${err.occueredAt}::Operational-${err.isOperational}::StatusCode-${err.statusCode}::Msg-${err.message}::ErrorStack-\n${err.stack}`
  );
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    time: err.occueredAt,
    isOperational: err.isOperational,
  });
};
