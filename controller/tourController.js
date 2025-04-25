const Tour = require("./../model/tourModel");
const APIFeatures = require("./../utils/apiFeatures");

//controllers
exports.getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).send(`💥 Error: ${err.message}`);
  }
};

exports.addTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body); // no validators passed as options, see modify tour, but same can be passed.
    res.status(200).json({
      status: "Success",
      data: newTour,
    });
  } catch (err) {
    res.status(404).send(`💥 Error: ${err.message}`);
  }
};

exports.modifyTour = async (req, res) => {
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

exports.deleteTour = async (req, res) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "Success",
    });
  } catch (err) {
    res.status(404).send(`💥 Error: ${err.message}`);
  }
};

exports.getTour = async (req, res) => {
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

exports.getStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).send(`💥 Error: ${err.message}`);
  }
};

//this middleware prefills the query with certain objects.
exports.aliasTopCheap = (req, res, next) => {
  req.url =
    "/?sort=-ratingsAverage,price&fields=ratingsAverage,price,name,difficulty,summary&limit=5";
  next();
};
