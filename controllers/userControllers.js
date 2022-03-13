const User = require("../models/user");
const BigPromise = require("../middlewares/bigPromise");
const cookieToken = require("../utils/cookieToken");
const cloudinary = require("cloudinary");
const CustomError = require("../utils/CustomError");
const mailHelper = require("../utils/emailHelpers");
const crypto = require("crypto");

exports.signup = BigPromise(async (res, req, next) => {
  //let result;

  if (!req.files) {
    return next(new CustomError("photo is required for signup", 400));
  }

  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(new CustomError("Name, email and password are required", 400));
  }

  let file = req.files.photo;

  const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (res, req, next) => {
  const { email, password } = req.body;

  // check for presence of email and password
  if (!email || !password) {
    return next(new CustomError("please provide email and password", 400));
  }

  // get user from DB
  const user = await User.findOne({ email }).select("+password");

  // if user not found in DB
  if (!user) {
    return next(
      new CustomError("Email or password does not match or exist", 400)
    );
  }

  // match the password
  const isPasswordCorrect = await user.isValidatedPassword(password);

  //if password do not match
  if (!isPasswordCorrect) {
    return next(
      new CustomError("Email or password does not match or exist", 400)
    );
  }

  // if all goes good and we send the token
  cookieToken(user, res);
});

exports.logout = BigPromise(async (res, req, next) => {
  //clear the cookie
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  //send JSON response for success
  res.status(200).json({
    succes: true,
    message: "Logout success",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  // collect email
  const { email } = req.body;

  // find user in database
  const user = await User.findOne({ email });

  // if user not found in database
  if (!user) {
    return next(new CustomError("Email not found as registered", 400));
  }

  //get token from user model methods
  const forgotToken = user.getForgotPasswordToken();

  // save user fields in DB
  await user.save({ validateBeforeSave: false });

  // create a URL
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  // craft a message
  const message = `Copy paste this link in your URL and hit enter \n\n ${myUrl}`;

  // attempt to send email
  try {
    await mailHelper({
      email: user.email,
      subject: "LCO TStore - Password reset email",
      message,
    });

    // json reponse if email is success
    res.status(200).json({
      succes: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    // reset user fields if things goes wrong
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // send error response
    return next(new CustomError(error.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  //get token from params
  const token = req.params.token;

  // hash the token as db also stores the hashed version
  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  // find user based on hased on token and time in future
  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  // check if password and conf password matched
  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new CustomError("password and confirm password do not match", 400)
    );
  }

  // update password field in DB
  user.password = req.body.password;

  // reset token fields
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  // save the user
  await user.save();

  // send a JSON response OR send token

  cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (res, req, next) => {
  //req.user will be added by middleware
  // find user by id
  const user = await User.findById(req.user.id);

  //send response and user data
  res.status(200).json({
    success: true,
    user,
  });
});

exports.changeUserPassword = BigPromise(async (res, req, next) => {
  //only after logged in give id bcz of middleware
  const userId = req.user.id;
  const user = await User.findById(userId).select("+password");
  const isCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );
  if (!isCorrectOldPassword) {
    return next(new CustomError("Old Password is Incorrect", 400));
  }
  //Update if password is Correct
  user.password = req.body.password;
  await user.save();
  //pass change so update Token
  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (res, req, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.files) {
    const user = await User.findById(req.user.id);
    const imageId = user.photo.id;

    const resp = await cloudinary.v2.uploader.destroy(imageId);
    const result = await cloudinary.v2.uploader.upload(
      req.files.photo.tempFilePath,
      {
        folder: "users",
        width: 150,
        crop: "scale",
      }
    );
    newData.photo = {
      id: result.public_id,
      secure_url: result.secure_url,
    };
  }
  if (newData.email && newData.name !== "") {
    const user = await User.findByIdAndUpdate(req.user.id, newData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } else {
    return next(new CustomError("Name & Email Is Required", 400));
  }
});

exports.adminAllUser = BigPromise(async (res, req, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

exports.getOneUser = BigPromise(async (res, req, next) => {
  const users = await User.findById(req.params.id);
  if (!users) {
    return next(new CustomError("User Not Found", 400));
  }

  res.status(200).json({
    success: true,
    users,
  });
});

exports.updateOneUserDetails = BigPromise(async (res, req, next) => {
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  // if (req.files) {
  //   const user = await User.findById(req.params.id);
  //   const imageId = user.photo.id;

  //   const resp = await cloudinary.v2.uploader.destroy(imageId);
  //   const result = await cloudinary.v2.uploader.upload(
  //     req.files.photo.tempFilePath,
  //     {
  //       folder: "users",
  //       width: 150,
  //       crop: "scale",
  //     }
  //   );
  //   newData.photo = {
  //     id: result.public_id,
  //     secure_url: result.secure_url,
  //   };
  // }
  // if (newData.email && newData.name !== "") {
  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.deleteOneUser = BigPromise(async (res, req, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new CustomError("User Not Found", 400));
  }

  // get image id from user in database
  const imageId = user.photo.id;

  // delete image from cloudinary
  await cloudinary.v2.uploader.destroy(imageId);

  // remove user from databse
  await user.remove();

  res.status(200).json({
    success: true,
  });
});

exports.manageAllUser = BigPromise(async (res, req, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});
