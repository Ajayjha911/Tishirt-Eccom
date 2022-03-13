const Order = require("../models/order");
// const Product = require("../models/product");

const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");

exports.createOrder = BigPromise(async (res, req, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (res, req, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new CustomError("Order Not Found", 400));
  }

  res.status(200).json({
    success: true,
    order,
  });
});
exports.getLoggedInOrders = BigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminGetAllOrder = BigPromise(async (res, req, next) => {
  const order = await Order.find();
  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminGetAllOrder = BigPromise(async (res, req, next) => {
  const order = await Order.find();
  res.status(200).json({
    success: true,
    order,
  });
});

exports.UpdateOrder = BigPromise(async (res, req, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new CustomError("Order Not Found", 400));
  }
  if (order.orderStatus === "Delivered") {
    return next(new CustomError("Order is already marked for delivered", 401));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (prod) => {
    await updateStock(prod.product, prod.quantity);
  });

  await order.save();
  res.status(200).json({
    success: true,
    order,
  });
});

const updateStock = async (productId, quantity) => {
  const product = await Product.findById(productId);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
};

exports.DeleteOrder = BigPromise(async (res, req, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new CustomError("Order Not Found Can't Be Deleted", 400));
  }
  await order.remove();
  res.status(200).json({
    success: true,
    message: "Order deleted",
  });
});
