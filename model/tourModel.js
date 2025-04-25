const mongoose = require("mongoose");
const slugify = require("slugify");

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
    select: false, //this flag permanently removes this from projection but data is still available on collections.
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },
  slug: {
    type: String,
  },
});

//DOCUMENT MIDDLEWARE - PRE HOOK : runs before .save() and .create()
// lets craete a slug for each document using this middleware.
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//QUERY MIDDLEWARE : fires before find, and filters out all secretTours.
// istead of find if we want to trigger this on find, findOne, findOneAndDelete etc use a regex `/^find/` i.e. all words starting with find.
tourSchema.pre("find", function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

//AGGREGATION MIDDLEWARE : removes secret tours for aggregates.
tourSchema.pre("aggregate", function (next) {
  // console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = new mongoose.model("Tour", tourSchema);

module.exports = Tour;
