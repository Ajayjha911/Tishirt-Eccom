const express = require("express");
const {
  createOrder,
  getOneOrder,
  getLoggedInOrders,
  adminGetAllOrder,
  DeleteOrder,
  UpdateOrder,
} = require("../controllers/orderControllers");

const router = express.Router();

const {
  isLoggedIn,
  customRole,
  // customRole
} = require("../middlewares/user");
//userRotes
router.route("/order/create").post(isLoggedIn, createOrder);
router.route("/order/:id").get(isLoggedIn, getOneOrder);
router.route("/order/:id").get(isLoggedIn, getLoggedInOrders);

//Admin Route
router
  .route("admin/orders/:id")
  .get(isLoggedIn, customRole("admin"), adminGetAllOrder);

router
  .route("admin/order/:id")
  .put(isLoggedIn, customRole("admin"), UpdateOrder)
  .delete(isLoggedIn, customRole("admin"), DeleteOrder);
module.exports = router;
