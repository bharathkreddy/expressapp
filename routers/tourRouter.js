// this helps seperate out mini-app or resource specific code in its own module , middleware added to this mini-app would be specific for this mini-app.
// from prev commit - lets now seperate route handlers into controllers section

const fs = require("fs");
const express = require("express");
const router = express.Router();
const tourcontroller = require("./../controller/tourController");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8")
);

// add middleware to run on a particular param - in this case on id param, this id is passed as val in the callback.
router.param("id", (req, res, next, val) => {
  console.log(`param :: ${val} :: used and middleware invoked`); //not here val not id
  next(); // use next for the other .get middleware to be invoked next, if not used the traffic would stop.
});

// a nice usecase for this is to do all checks at one place example check if ID exists and returning failure can be done at one place instead of all the functions.
router.param("id", tourcontroller.checkId);

router
  .get("/", tourcontroller.getAllTours)
  .get("/:id", tourcontroller.getTour)
  .post("/", tourcontroller.createTour)
  .patch("/:id", tourcontroller.updateTour)
  .delete("/:id", tourcontroller.deleteTour);

module.exports = router;
