// this helps seperate out mini-app or resource specific code in its own module , middleware added to this mini-app would be specific for this mini-app.
// from prev commit - lets now seperate route handlers into controllers section

const fs = require("fs");
const express = require("express");
const router = express.Router();
const tourcontroller = require("./../controller/tourController");

// add middleware to run on a particular param - in this case on id param, this id is passed as val in the callback.
router.param("id", (req, res, next, val) => {
  console.log(`param :: ${val} :: used and middleware invoked`); //not here val not id
  next(); // use next for the other .get middleware to be invoked next, if not used the traffic would stop.
});

// a nice usecase for this is to do all checks at one place example check if ID exists and returning failure can be done at one place instead of all the functions.
router.param("id", tourcontroller.checkId);

router
  .route("/")
  .get(tourcontroller.getAllTours)
  .post(tourcontroller.checkPostBody, tourcontroller.createTour); // configure a middleware to be run only on a particular type of request.

router
  .route("/:id")
  .get(tourcontroller.getTour)
  .patch(tourcontroller.updateTour)
  .delete(tourcontroller.deleteTour);

module.exports = router;
