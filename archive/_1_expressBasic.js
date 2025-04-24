const fs = require("fs");
const express = require("express");

const app = express();
const port = 3000;
app.use(express.json());

// convert string object to json before using. readfile allways gives back a string //
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, "utf-8")
);

app.get("/api/v1/tours", (req, res) => {
  res.json({
    status: "success",
    length: tours.length,
    data: {
      tours: tours,
    },
  });
});

app.get("/api/v1/tours/:id", (req, res) => {
  const id = Number(req.params.id);
  const tour = tours.find((el) => el.id === id);
  if (!tour)
    return res.status(404).json({ status: "Fail", message: "Invalid ID." });
  res.json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});

app.post("/api/v1/tours", (req, res) => {
  const newTourid = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newTourid }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      if (err) res.status(500).send("We screwed up something ☹️");
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    }
  );
});

app.patch("/api/v1/tours/:id", (req, res) => {
  const [id, tourUpdate] = [Number(req.params.id), req.body];
  const fetchTour = tours.find((tour) => tour.id === id);

  if (!fetchTour)
    return res.status(404).json({ status: "Failed", message: "Invalid ID." });

  const newTour = tours.filter((tour) => tour.id !== id);

  newTour.push(Object.assign(fetchTour, tourUpdate));

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(newTour),
    (err) => {
      if (err) res.status(500).send("We screwed up something ☹️");
      res.status(200).json({
        status: "success",
        message: `tour ${id} patched`,
      });
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
