const express = require("express");
const morgan = require("morgan");
const qs = require("qs");
const appError = require("./utils/appError");
const globalErrorController = require("./controller/errorController");
const tourRouter = require("./routers/tourRouter");

// ✅ intialize the app
const app = express();

// ✅ Set a custom query parser using qs, we use .set to set the internal parsing engine for queries to qs, .use is used to mount the middleware.
// If .set("query parser", ...) is called after any app.use() or route, the request may already be initialized with the default querystring parser,
// which doesn't handle bracket notation or nested keys.
app.set("query parser", (str) => qs.parse(str));

// ✅ attach middleware
app.use(morgan("combined"));

// ✅ attach routes
app.use("/api/v1/tours", tourRouter);

// ✅ Unhandled Route middleware. (Readme section 7)
app.all("/{*any}", (req, res, next) => {
  next(new appError(`can't find on server - ${req.originalUrl}`, 404));
});

// ✅ Global Error handler
app.use(globalErrorController);

// ✅ export the app`
module.exports = app;
