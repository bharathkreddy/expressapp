// A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.

const express = require("express");
const router = express.Router();

const tourController = require("./../controller/tourController");

//middleware
router.use(express.json()); //Parses JSON body in req.body (from the request payload)

// middleware that is specific to this router
const requestLog = (req, res, next) => {
  console.log("🔸 Request Method:", req.method);
  console.log("🔹 Request URL:", req.originalUrl);
  if (Object.keys(req.params).length > 0) {
    console.log("🧾 Request Params:", req.params);
  }
  if (req.body) {
    console.log("📦 Request Body:", req.body);
  }
  if (req.query) {
    console.log("❓ Request Query:", req.query);
  }
  next();
};

// req.params only exists after a matching route pattern with parameters (e.g., /:id) is found. hence we cant use below.
// Middleware registered with router.use(...) doesn't have access to req.params if it runs before the route match.

// router.use(requestLog)

// define the tour route

router
  .route("/")
  .get(requestLog, tourController.getAllTours)
  .post(requestLog, tourController.addTour);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopCheap, tourController.getAllTours);

router
  .route("/:id")
  .get(requestLog, tourController.getTour)
  .patch(requestLog, tourController.modifyTour)
  .delete(requestLog, tourController.deleteTour);

module.exports = router;
