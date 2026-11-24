const express = require("express");
const userRouter = express.Router();
const userController = require("../controller/userController");
const { verifyToken } = require("../utils/token.service");
const validateMiddleWare = require("../middleware/validate");
const { updateJobSeekerStatusSchema } = require("../validations/auth.validation");

// Get all agencies (public endpoint for registration dropdown)
userRouter.get("/agencies", userController.getAllAgencies);

// Get current user profile (protected)
userRouter.get("/profile", verifyToken, userController.getCurrentUserProfile);

// Get job seekers for an agency (protected - agency only)
userRouter.get(
  "/job-seekers",
  verifyToken,
  userController.getJobSeekersByAgency
);

// Get agency details for job seeker (protected - job seeker only)
userRouter.get("/agency-details", verifyToken, userController.getAgencyDetails);

// Update job seeker status (protected - agency only)
userRouter.put(
  "/job-seeker-status",
  verifyToken,
  validateMiddleWare(updateJobSeekerStatusSchema),
  userController.updateJobSeekerStatus
);

module.exports = userRouter;


