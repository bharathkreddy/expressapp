const Tour = require("./../model/tourModel");

//controllers
exports.getAllTours = async (req, res) => {
  try {
    // Building a query
    const excludedFields = ["page", "sort", "limit", "fields"];
    const queryObj = { ...req.query }; //we need to make a copy and not modify the original request.
    excludedFields.forEach((SpecialWord) => delete queryObj[SpecialWord]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const mongoQuery = JSON.parse(queryStr);
    let query = Tour.find(mongoQuery);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    }

    // Projecting
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v"); //excluding the __v which mongo creates for its internal use.
    }

    // Pagination
    const page = req.query.page * 1 || 1; //if no user page then default of 1 page - allways good to limit resuts and prevent an explosion.
    const limit = req.query.limit * 1 || 100; //multiply by 1 to convert strings to a number.
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // only when a page is provided , check if no of skipped records is > total records and throw an erorr.
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error("🤥 This page does not exist!");
    }

    // Executing the query
    const tours = await query; // this now returns the result from .find which returns a query object.

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
