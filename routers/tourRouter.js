// A Router instance is a complete middleware and routing system; for this reason, it is often referred to as a “mini-app”.

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// mongoose connection
mongoose.connect(process.env.MONGOURL, {
  tls: true,
  tlsCertificateKeyFile: process.env.MONGOCERTPATH,
  authMechanism: "MONGODB-X509",
  authSource: "$external",
  dbName: "tours", // specify the database here!
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

// mongoose models

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "A tour name must have less or equal then 40 characters"],
    minlength: [10, "A tour name must have more or equal then 10 characters"],
    // validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty"],
    enum: {
      values: ["easy", "medium", "difficult"],
      message: "Difficulty is either: easy, medium, difficult",
    },
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        // this only points to current doc on NEW document creation
        return val < this.price;
      },
      message: "Discount price ({VALUE}) should be below regular price",
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, "A tour must have a description"],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },
});

const Tour = new mongoose.model("Tour", tourSchema);

//route handlers
const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: "Success",
      length: tours.length,
      data: tours,
    });
  } catch (err) {
    res.status(404).send(`💥 Error: ${err.message}`);
  }
};

const addTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(200).json({
      status: "Success",
      data: newTour,
    });
  } catch (err) {
    res.status(404).send(`💥 Error: ${err.message}`);
  }
};

const modifyTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json({
      status: "Success",
      data: updatedTour,
    });
  } catch (err) {
    res.status(404).send(`💥 Error: ${err.message}`);
  }
};

const deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "Success",
    });
  } catch (err) {
    res.status(404).send(`💥 Error: ${err.message}`);
  }
};

const getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: "Success",
      data: tour,
    });
  } catch (err) {
    res.status(404).send(`💥 Error: ${err.message}`);
  }
};

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
  next();
};

router.use(express.json());

// req.params only exists after a matching route pattern with parameters (e.g., /:id) is found. hence we cant use below.
// Middleware registered with router.use(...) doesn't have access to req.params if it runs before the route match.

// router.use(requestLog)

// define the tour route

router.route("/").get(requestLog, getAllTours).post(requestLog, addTour);

router
  .route("/:id")
  .get(requestLog, getTour)
  .patch(requestLog, modifyTour)
  .delete(requestLog, deleteTour);

module.exports = router;
