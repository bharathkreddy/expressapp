const express = require("express");
const userController = require("./../controller/userController");
const authController = require("./../controller/authController");
const router = express.Router();
router.use(express.json());

router.route("/signup").post(authController.signup);
router.route("/").get(userController.getAllUser).post(userController.AddUser);
router
  .route("/:id")
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.modifyUser);

module.exports = router;
