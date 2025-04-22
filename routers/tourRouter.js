// this helps seperate out mini-app or resource specific code in its own module , middleware added to this mini-app would be specific for this mini-app.

const fs = require("fs");
const express = require("express");
const router = express.Router();

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8")
);

// add middleware to run on a particular param - in this case on id param, this id is passed as val in the callback.
router.param("id", (req, res, next, val) => {
  console.log(`param :: ${val} :: used and middleware invoked`); //not here val not id
  next(); // use next for the other .get middleware to be invoked next, if not used the traffic would stop.
});

// a nice usecase for this is to do all checks at one place example check if ID exists and returning failure can be done at one place instead of all the functions.
router.param("id", (req, res, next, val) => {
  if (!isFinite(val))
    return res //use return statement for middleware to stop moving ahead. We want to send the responce and not move ahead here.
      .status(404)
      .json({ status: "Failed", message: `ID:${val} does not exist.` });

  const tour = tours.find((tour) => tour.id === Number(val));

  if (!tour)
    return res //use return statement for middleware to stop moving ahead. We want to send the responce and not move ahead here.
      .status(404)
      .json({ status: "Failed", message: `ID:${val} does not exist.` });

  next(); // to move ahead with next middleware
});

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "Success",
    length: tours.length,
    data: tours,
  });
};

const getTour = (req, res) => {
  const id = req.params.id;
  //   if (!isFinite(id))
  //     return res
  //       .status(404)
  //       .json({ status: "Failed", message: "ID does not exist." });

  const tour = tours.find((tour) => tour.id === Number(id));
  //   if (!tour)
  //     return res
  //       .status(404)
  //       .json({ status: "Failed", message: "ID does not exist." });
  res.status(200).json({
    status: "Success",
    data: tour,
  });
};

const createTour = (req, res) => {
  const id = tours[tours.length - 1].id + 1;
  const tour = Object.assign({ id: id }, req.body);
  tours.push(tour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err)
        return res.status(500).json({
          status: "Failed",
          message: "could not add tour, please retry.",
        });
    }
  );

  res.status(200).json({
    status: "Success",
    data: tour,
  });
};

const updateTour = (req, res) => {
  const id = req.params.id;
  //   if (!isFinite(id))
  //     return res
  //       .status(404)
  //       .json({ status: "Failed", message: "ID does not exist." });
  const oldtour = tours.find((tour) => tour.id === Number(id));
  //   if (!oldtour)
  //     return res
  //       .status(404)
  //       .json({ status: "Failed", message: "ID does not exist." });
  const newTour = tours.filter((tour) => tour.id !== Number(id));
  newTour.push(Object.assign(oldtour, req.body));
  res.status(200).json({
    status: "Success",
    data: Object.assign(oldtour, req.body),
  });
};

const deleteTour = (req, res) => {
  const id = req.params.id;
  //   if (!isFinite(id))
  //     return res
  //       .status(404)
  //       .json({ status: "Failed", message: "ID does not exist." });
  const oldtour = tours.find((tour) => tour.id === Number(id));
  //   if (!oldtour)
  //     return res
  //       .status(404)
  //       .json({ status: "Failed", message: "ID does not exist." });
  const newTour = tours.filter((tour) => tour.id !== Number(id));
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(newTour),
    (err) => {
      if (err)
        return res.status(500).json({
          status: "Failed",
          message: "could not delete tour, please retry.",
        });
    }
  );

  res.status(200).json({
    status: "Success",
  });
};

router
  .get("/", getAllTours)
  .get("/:id", getTour)
  .post("/", createTour)
  .patch("/:id", updateTour)
  .delete("/:id", deleteTour);

module.exports = router;
