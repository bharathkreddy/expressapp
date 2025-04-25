const Tour = require("./../model/tourModel");
const APIFeatures = require("./../utils/apiFeatures");
const appError = require("./../utils/appError");

// takes a function and returns a function(which is a promice in this case and hence can have .catch method chained to it.)
//Since we catch errors in catch block, we need not do it inside the function anymore getting rid of try, catch blocks in each controller function.
const catchAsynch = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

//controllers
exports.getAllTours = catchAsynch(async (req, res, next) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .project()
    .paginate()
    .sort();
  const tours = await features.query;

  res.status(200).json({
    status: "Success",
    length: tours.length,
    data: tours,
  });
});

exports.addTour = catchAsynch(async (req, res, next) => {
  const newTour = await Tour.create(req.body); // no validators passed as options, see modify tour, but same can be passed.
  res.status(200).json({
    status: "Success",
    data: newTour,
  });
});

exports.modifyTour = catchAsynch(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
  });

  if (!tour) {
    return next(
      new appError(`can't find on server, tour with id - ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "Success",
    data: tour,
  });
});

exports.deleteTour = catchAsynch(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(
      new appError(`can't find on server, tour with id - ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    status: "Success",
  });
});

exports.getTour = catchAsynch(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(
      new appError(`can't find on server, tour with id - ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    status: "Success",
    data: tour,
  });
});

exports.getStats = catchAsynch(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // Stage 1: Filter tours by difficulty
    {
      $match: { ratingsAverage: { $gte: 4 } },
    },
    // Stage 2: Group remaining documents  and calculate total quantity
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 }, //adds 1 for each document
        avgPrice: { $avg: "$price" },
        averageRating: { $avg: "$ratingsAverage" },
        totalRatings: { $sum: "$ratingsQuantity" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);
  res.status(200).json({
    status: "Success",
    data: stats,
  });
});

//this middleware prefills the query with certain objects.
exports.aliasTopCheap = (req, res, next) => {
  req.url =
    "/?sort=-ratingsAverage,price&fields=ratingsAverage,price,name,difficulty,summary&limit=5";
  next();
};
