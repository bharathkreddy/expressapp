const fs = require("fs");
const express = require("express");
const router = express.Router();

const userController = require("./../controller/userController");

router
  .get("/", userController.getAllUsers)
  .get("/:id", userController.getuser)
  .post("/", userController.createuser)
  .patch("/:id", userController.updateuser)
  .delete("/:id", userController.deleteUser);

module.exports = router;
