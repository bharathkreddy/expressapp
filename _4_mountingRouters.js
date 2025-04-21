const fs = require("fs");
const express = require("express");
const morgan = require("morgan");

const app = express();
const port = 3000;

// MIDDLEWARE
app.use(morgan("dev"));
app.use(express.json());

// custom middleware : will create a log on every request - check to end of the file to see where this middleware is used //
const myLogger = function (req, res, next) {
  console.log(`BRK logger: ${new Date().toISOString()}:`);
  next();
};

// INITIAL DATA LOADS
// convert string object to json before using. readfile allways gives back a string //
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, "utf-8")
);

// ROUTE HANDLERS

const getAllTours = (req, res) => {
  res.json({
    status: "success",
    length: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getTourbyID = (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((el) => el.id === id);
  if (!tour)
    return res.status(404).json({ status: "Fail", message: "Invalid ID." });
  res.json({
    status: "success",
    data: {
      tour: tour,
    },
  });
};

const addTour = (req, res) => {
  const newTourid = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newTourid }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) res.status(500).send("We screwed up something ☹️");
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const modifyTour = (req, res) => {
  const [id, tourUpdate] = [Number(req.params.id), req.body];
  const fetchTour = tours.find((tour) => tour.id === id);

  if (!fetchTour)
    return res.status(404).json({ status: "Failed", message: "Invalid ID." });

  const newTour = tours.filter((tour) => tour.id !== id);

  newTour.push(Object.assign(fetchTour, tourUpdate));

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(newTour),
    (err) => {
      if (err) res.status(500).send("We screwed up something ☹️");
      res.status(200).json({
        status: "success",
        message: `tour ${id} patched`,
      });
    }
  );
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This Route is still not implemented.",
  });
};
const addUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This Route is still not implemented.",
  });
};
const getUserbyID = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This Route is still not implemented.",
  });
};
const modifyUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This Route is still not implemented.",
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: "Error",
    message: "This Route is still not implemented.",
  });
};

// ROUTES

app.route("/api/v1/tours").get(getAllTours).post(addTour);
app.route("/api/v1/users").get(getAllUsers).post(addUser);
app.use(myLogger); //middlewares are acted on in same order as they are defined in the script  below middleware doesnt act on above route but only on below one.
app.route("/api/v1/tours/:id").get(getTourbyID).patch(modifyTour);
app
  .route("/api/v1/users/:id")
  .get(getUserbyID)
  .patch(modifyUser)
  .delete(deleteUser);

// SERVER START

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
