const express = require("express");
const morgan = require("morgan");
const qs = require("qs");
const rateLimit = require("express-rate-limit");

const appError = require("./utils/appError");
const globalErrorController = require("./controller/errorController");
const tourRouter = require("./routers/tourRouter");
const userRouter = require("./routers/userRouter");

// ✅ intialize the app
const app = express();

// ✅ Set a custom query parser using qs, we use .set to set the internal parsing engine for queries to qs, .use is used to mount the middleware.
// If .set("query parser", ...) is called after any app.use() or route, the request may already be initialized with the default querystring parser,
// which doesn't handle bracket notation or nested keys.
app.set("query parser", (str) => qs.parse(str));

// ✅ attach middleware
app.use(morgan("combined"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too Many requests from this IP, please try again in 15 minutes.", // Message to display on breach
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use("/api", limiter);

// ✅ attach routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// ✅ Unhandled Route middleware. (Readme section 7)
app.all("/{*any}", (req, res, next) => {
  next(new appError(`can't find on server - ${req.originalUrl}`, 404));
});

// ✅ Global Error handler
app.use(globalErrorController);

// ✅ export the app`
module.exports = app;
