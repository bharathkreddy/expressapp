const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  duration: {
    type: Number,
    required: true,
    default: 2,
  },
  maxGroupSize: {
    type: Number,
    default: 4,
  },
  difficulty: {
    type: String,
  },
  ratingsAverage: Number,
  ratingsQuantity: Number,
  price: Number,
  summary: String,
  description: String,
  imageCover: String,
  images: [String],
  startDates: [Date],
});

const Tour = new mongoose.model("Tour", tourSchema);

module.exports = Tour;

// const testTour = Tour({
//   name: "test tour",
//   duration: 12,
//   difficulty: "Easy",
// });

// testTour
//   .save()
//   .then((doc) => console.log(doc))
//   .catch((err) => console.log(`💥 ${err.message}`));
