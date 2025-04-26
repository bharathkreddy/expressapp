// A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.
const qs = require("qs");
const express = require("express");
const router = express.Router();

const tourController = require("./../controller/tourController");
const authController = require("./../controller/authController");

//middleware
router.use(express.json()); //Parses JSON body in req.body (from the request payload)

// middleware that is specific to this router
const requestLog = (req, res, next) => {
  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  console.log("🔸 Request Method:", req.method);
  console.log("🔹 Request URL:", req.originalUrl);
  if (Object.keys(req.params).length > 0) {
    console.log("🧾 Request Params:", req.params);
  }
  if (req.body) {
    console.log("📦 Request Body:", req.body);
  }
  if (req.query) {
    console.log("❓ Request Query:", qs.parse(req.query));
  }
  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
  next();
};

// req.params only exists after a matching route pattern with parameters (e.g., /:id) is found. hence we cant use below.
// Middleware registered with router.use(...) doesn't have access to req.params if it runs before the route match.

// router.use(requestLog)

// define the tour route

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect, tourController.addTour);

router
  .route("/top-5-cheap")
  .get(tourController.aliasTopCheap, tourController.getAllTours);

router.route("/getstats").get(tourController.getStats);

router
  .route("/:id")
  .get(authController.protect, tourController.getTour)
  .patch(authController.protect, tourController.modifyTour)
  .delete(authController.protect, tourController.deleteTour);

module.exports = router;
