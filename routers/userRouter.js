const express = require("express");
const userController = require("./../controller/userController");
const authController = require("./../controller/authController");
const router = express.Router();
router.use(express.json());

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

router
  .route("/")
  .get(authController.protect, userController.getAllUser)
  .post(authController.protect, userController.AddUser);
router
  .route("/:id")
  .get(authController.protect, userController.getUser)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    userController.deleteUser
  )
  .patch(authController.protect, userController.modifyUser);

module.exports = router;
