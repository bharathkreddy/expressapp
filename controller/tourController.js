const Tour = require("./../model/tourModel");

//controllers
exports.getAllTours = async (req, res) => {
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
