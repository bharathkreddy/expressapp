const fs = require("fs");

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, "utf-8")
);

exports.checkId = (req, res, next, val) => {
  if (!isFinite(val))
    return res //use return statement for middleware to stop moving ahead. We want to send the responce and not move ahead here.
      .status(404)
      .json({ status: "Failed", message: `ID:${val} does not exist.` });

  const tour = tours.find((tour) => tour.id === Number(val));

  if (!tour)
    return res //use return statement for middleware to stop moving ahead. We want to send the responce and not move ahead here.
      .status(404)
      .json({ status: "Failed", message: `ID:${val} does not exist.` });

  next(); // to move ahead with next middleware
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "Success",
    length: tours.length,
    data: tours,
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id;
  const tour = tours.find((tour) => tour.id === Number(id));

  res.status(200).json({
    status: "Success",
    data: tour,
  });
};

exports.createTour = (req, res) => {
  const id = tours[tours.length - 1].id + 1;
  const tour = Object.assign({ id: id }, req.body);
  tours.push(tour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err)
        return res.status(500).json({
          status: "Failed",
          message: "could not add tour, please retry.",
        });
    }
  );

  res.status(200).json({
    status: "Success",
    data: tour,
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id;
  const oldtour = tours.find((tour) => tour.id === Number(id));
  const newTour = tours.filter((tour) => tour.id !== Number(id));

  newTour.push(Object.assign(oldtour, req.body));
  res.status(200).json({
    status: "Success",
    data: Object.assign(oldtour, req.body),
  });
};

exports.deleteTour = (req, res) => {
  const id = req.params.id;
  const oldtour = tours.find((tour) => tour.id === Number(id));
  const newTour = tours.filter((tour) => tour.id !== Number(id));

  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(newTour),
    (err) => {
      if (err)
        return res.status(500).json({
          status: "Failed",
          message: "could not delete tour, please retry.",
        });
    }
  );

  res.status(200).json({
    status: "Success",
  });
};
