const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  forgotPassword,
  passwordReset,
  getLoggedInUserDetails,
  changeUserPassword,
  updateUserDetails,
  adminAllUser,
  manageAllUser,
  getOneUser,
  updateOneUserDetails,
  deleteOneUser,
} = require("../controllers/userControllers");
const { isLoggedIn, customRole } = require("../middlewares/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
router.route("/userdashboard").get(isLoggedIn, getLoggedInUserDetails);
router.route("/password/update").post(isLoggedIn, changeUserPassword);
router.route("/userdashboard/update").post(isLoggedIn, updateUserDetails);
router
  .route("/admin/user/:id")
  .get(isLoggedIn, customRole("admin"), getOneUser)
  .put(isLoggedIn, customRole("admin"), updateOneUserDetails)
  .delete(isLoggedIn, customRole("admin"), deleteOneUser);
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser);

router
  .route("/manager/users")
  .get(isLoggedIn, customRole("manager"), manageAllUser);
module.exports = router;
