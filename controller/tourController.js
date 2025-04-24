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
    const newTour = await Tour.create(req.body);
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
