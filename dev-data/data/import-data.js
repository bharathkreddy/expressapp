const dotenv = require("dotenv").config(); // env is loaded from where node is run so if i run node ./dev-data/data/import-data.json, .env is found without config.
const mongoose = require("mongoose");
const Tour = require("./../../models/tourModel");

const fs = require("fs");

mongoose
  .connect(process.env.MONGOURL, {
    tls: true,
    tlsCertificateKeyFile: process.env.MONGOCERTPATH,
    authMechanism: "MONGODB-X509",
    authSource: "$external",
    dbName: "tours", // specify the database here!
  })
  .then((coll) => console.log("🥭 Mongo connection Successful"))
  .catch((err) => console.error(`💥 ${err.message}`));

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8")
);

async function transferData() {
  try {
    await Tour.insertMany(tours);
  } catch (err) {
    console.log(err.message);
  }
}

transferData();
