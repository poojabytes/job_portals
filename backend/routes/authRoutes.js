const express = require("express");
const authRouter = express.Router();
const authController = require("../controller/authController");
const uploadController = require("../controller/uploadController");
const validateMiddleWare = require("../middleware/validate");
const upload = require("../middleware/multer");
const {
  registerJoiSchema,
  verifyOTPJoiSchema,
  resendOTPJoiSchema,
  setPasswordJoiSchema,
  loginJoiSchema,
} = require("../validations/auth.validation");

// Upload files (profile image and resume)
authRouter.post(
  "/upload",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  uploadController.uploadFiles
);

// Register user (now accepts file paths instead of files)
authRouter.post(
  "/register",
  validateMiddleWare(registerJoiSchema),
  authController.registerUser
);

// Verify OTP
authRouter.post(
  "/verify-otp",
  validateMiddleWare(verifyOTPJoiSchema),
  authController.verifyOTP
);

// Resend OTP
authRouter.post(
  "/resend-otp",
  validateMiddleWare(resendOTPJoiSchema),
  authController.resendOTP
);

// Set Password
authRouter.post(
  "/set-password",
  validateMiddleWare(setPasswordJoiSchema),
  authController.setPassword
);

// Login
authRouter.post(
  "/login",
  validateMiddleWare(loginJoiSchema),
  authController.loginUser
);

module.exports = authRouter;


