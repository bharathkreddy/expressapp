const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routers/tourRouter");

//app init
const app = express();

//middleware
app.use(morgan("combined"));

//routes

app.get("/", (req, res) => {
  res.send("all ok working.");
});

app.use("/api/v1/tours", tourRouter);

module.exports = app;
