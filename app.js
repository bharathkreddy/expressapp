const express = require("express");
const morgan = require("morgan");
const qs = require("qs");

const tourRouter = require("./routers/tourRouter");

//app init
const app = express();

//middleware common to entire app
app.use(morgan("combined"));
// Set a custom query parser using qs, we use .set to set the internal parsing engine for queries to qs, .use is used to mount the middleware.
app.set("query parser", (str) => qs.parse(str));

//routes

app.get("/", (req, res) => {
  res.send("all ok working.");
});

app.use("/api/v1/tours", tourRouter);

module.exports = app;
