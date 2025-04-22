const fs = require("fs");
const express = require("express");
const router = express.Router();

const getAllUsers = (req, res) => {
  res
    .status(500)
    .json({ status: "failed", message: "API still to be defined." });
};
const getuser = (req, res) => {
  res
    .status(500)
    .json({ status: "failed", message: "API still to be defined." });
};
const createuser = (req, res) => {
  res
    .status(500)
    .json({ status: "failed", message: "API still to be defined." });
};
const updateuser = (req, res) => {
  res
    .status(500)
    .json({ status: "failed", message: "API still to be defined." });
};
const deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: "failed", message: "API still to be defined." });
};

router
  .get("/", getAllUsers)
  .get("/:id", getuser)
  .post("/", createuser)
  .patch("/:id", updateuser)
  .delete("/:id", deleteUser);

module.exports = router;
