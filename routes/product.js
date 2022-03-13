const express = require("express");
const {
  addProduct,
  getAllProducts,
  getAdminAllProducts,
  getSingleProduct,
  adminUpdateSingleProduct,
  adminDeleteProduct,
  addReview,
  deleteReview,
  getOnlyReviewsForOneProduct,
} = require("../controllers/productControllers");

const router = express.Router();

const { isLoggedIn, customRole } = require("../middlewares/user");
//userRotes
router.route("/products").get(getAllProducts);
router.route("/product/:id").get(getSingleProduct);
router.route("/review").put(isLoggedIn, addReview);
router.route("/review").delete(isLoggedIn, deleteReview);
router.route("/reviews").get(isLoggedIn, getOnlyReviewsForOneProduct);

//AdminRoutes
router
  .route("/admin/product/add")
  .post(isLoggedIn, customRole("admin"), addProduct);
router
  .route("/admin/products")
  .get(isLoggedIn, customRole("admin"), getAdminAllProducts);
router
  .route("/admin/product/:id")
  .put(isLoggedIn, customRole("admin"), adminUpdateSingleProduct)
  .delete(isLoggedIn, customRole("admin"), adminDeleteProduct);

module.exports = router;
