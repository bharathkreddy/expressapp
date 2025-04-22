const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routers/tourRouter");
const userRouter = require("./routers/userRouter");

const app = express();
const port = 3000;

app.use(
  morgan(
    "[:date[clf]] :remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms"
  )
);
app.use(express.json());

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
