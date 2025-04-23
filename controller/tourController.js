const fs = require("fs");

const Tour = require("./../models/tourModel");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8")
);

exports.checkPostBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "📦 Request body Missing name or price",
    });
  }
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: "Success",
      length: tours.length,
      data: tours,
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: `💥 ${err.message}`,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const id = req.params.id;
    const tour = await Tour.findById(id).exec();
    res.status(200).json({
      status: "Success",
      data: tour,
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: `💥 ${err.message}`,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: "Success",
      data: newTour,
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: `💥 ${err.message}`,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const id = req.params.id;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      returnDocument: "after",
      runValidators: true,
      setDefaultsOnInsert: true,
    }); // last arg gives an option to return the updated document.
    res.status(200).json({
      status: "Success",
      data: tour,
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: `💥 ${err.message}`,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const id = req.params.id;
    const tour = await Tour.findByIdAndDelete(id);
    res.status(204).json({
      status: "Success",
    });
  } catch (err) {
    res.status(400).json({
      status: "Failed",
      message: `💥 ${err.message}`,
    });
  }
};
