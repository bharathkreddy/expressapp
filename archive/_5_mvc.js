const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routers/tourRouter");
const userRouter = require("./routers/userRouter");

const app = express();

app.use(
  morgan(
    "[:date[clf]] :remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms"
  )
);

app.use(express.json()); //Automatically parse incoming requests with a Content-Type: application/json header and populate req.body with the parsed object.

app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "MongoDB not connected" });
  }
  next();
});
app.get("/ping", (req, res) => {
  res.send("✅ Server is alive!");
});
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
