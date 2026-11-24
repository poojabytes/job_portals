const messages = require("../utils/message.utils");
const statusCodes = require("../utils/status.code");
const { User, Agency } = require("../config/database").db;
const {
  handleSuccessResponse,
  handleErrorResponse,
} = require("../utils/response.util");

// Get all agencies (for dropdown)
const getAllAgencies = async (req, res) => {
  try {
    const agencies = await Agency.findAll({
      where: { isDeleted: false },
      attributes: ["uuid", "name", "email", "phone", "address"],
      order: [["name", "ASC"]],
    });

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      messages.AGENCY_FETCHED_SUCCESSFULLY,
      { agencies }
    );
  } catch (error) {
    console.log(error);
    return handleErrorResponse(
      res,
      statusCodes.ERROR,
      messages.INTERNAL_SERVER_ERROR
    );
  }
};

// Get job seekers for an agency
const getJobSeekersByAgency = async (req, res) => {
  try {
    const { id } = req.user; // Agency user ID from token

    const agencyUser = await User.findOne({
      where: { uuid: id, userType: "Agency", isDeleted: false },
    });

    if (!agencyUser) {
      return handleErrorResponse(
        res,
        statusCodes.FORBIDDEN,
        "Only agencies can access this endpoint"
      );
    }

    // Find the agency by user's email
    const agency = await Agency.findOne({
      where: { email: agencyUser.email.toLowerCase().trim(), isDeleted: false },
    });

    if (!agency) {
      return handleErrorResponse(
        res,
        statusCodes.NOT_FOUND,
        messages.AGENCY_NOT_FOUND
      );
    }

    // Get all job seekers who selected this agency
    const jobSeekers = await User.findAll({
      where: {
        agencyId: agency.uuid,
        userType: "Job Seeker",
        isDeleted: false,
        isEmailVerified: true,
        isPasswordSet: true,
      },
      attributes: [
        "uuid",
        "firstName",
        "lastName",
        "email",
        "phone",
        "gender",
        "hobbies",
        "profileImage",
        "resume",
        "status",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      messages.JOB_SEEKERS_FETCHED_SUCCESSFULLY,
      { jobSeekers }
    );
  } catch (error) {
    console.log(error);
    return handleErrorResponse(
      res,
      statusCodes.ERROR,
      messages.INTERNAL_SERVER_ERROR
    );
  }
};

// Get current user profile
const getCurrentUserProfile = async (req, res) => {
  try {
    const { id } = req.user; // User ID from token

    const user = await User.findOne({
      where: { uuid: id, isDeleted: false },
      include: [
        {
          model: Agency,
          as: "agency",
          attributes: ["uuid", "name", "email", "phone", "address"],
        },
      ],
      attributes: [
        "uuid",
        "firstName",
        "lastName",
        "email",
        "phone",
        "gender",
        "userType",
        "hobbies",
        "profileImage",
        "resume",
        "status",
        "isEmailVerified",
        "isPasswordSet",
        "createdAt",
      ],
    });

    if (!user) {
      return handleErrorResponse(
        res,
        statusCodes.NOT_FOUND,
        messages.USER_NOT_FOUND
      );
    }

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      "User profile fetched successfully",
      { user }
    );
  } catch (error) {
    console.log(error);
    return handleErrorResponse(
      res,
      statusCodes.ERROR,
      messages.INTERNAL_SERVER_ERROR
    );
  }
};

// Get agency details for job seeker
const getAgencyDetails = async (req, res) => {
  try {
    const { id } = req.user; // Job seeker user ID from token

    const user = await User.findOne({
      where: { uuid: id, userType: "Job Seeker", isDeleted: false },
      include: [
        {
          model: Agency,
          as: "agency",
          attributes: ["uuid", "name", "email", "phone", "address"],
        },
      ],
      attributes: [
        "uuid",
        "firstName",
        "lastName",
        "email",
        "phone",
        "gender",
        "hobbies",
        "profileImage",
        "resume",
        "status",
      ],
    });

    if (!user) {
      return handleErrorResponse(
        res,
        statusCodes.FORBIDDEN,
        "Only job seekers can access this endpoint"
      );
    }

    if (!user.agency) {
      return handleErrorResponse(
        res,
        statusCodes.NOT_FOUND,
        "No agency assigned to this job seeker"
      );
    }

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      messages.AGENCY_FETCHED_SUCCESSFULLY,
      {
        agency: user.agency,
        user: {
          profileImage: user.profileImage,
          resume: user.resume,
        }
      }
    );
  } catch (error) {
    console.log(error);
    return handleErrorResponse(
      res,
      statusCodes.ERROR,
      messages.INTERNAL_SERVER_ERROR
    );
  }
};

// Update job seeker status (accept/decline)
const updateJobSeekerStatus = async (req, res) => {
  try {
    const { id } = req.user; // Agency user ID from token
    const { userId, status } = req.body;

    const agencyUser = await User.findOne({
      where: { uuid: id, userType: "Agency", isDeleted: false },
    });

    if (!agencyUser) {
      return handleErrorResponse(
        res,
        statusCodes.FORBIDDEN,
        "Only agencies can access this endpoint"
      );
    }

    // Find the agency by user's email
    const agency = await Agency.findOne({
      where: { email: agencyUser.email.toLowerCase().trim(), isDeleted: false },
    });

    if (!agency) {
      return handleErrorResponse(
        res,
        statusCodes.NOT_FOUND,
        messages.AGENCY_NOT_FOUND
      );
    }

    // Find the job seeker
    const jobSeeker = await User.findOne({
      where: {
        uuid: userId,
        agencyId: agency.uuid,
        userType: "Job Seeker",
        isDeleted: false,
      },
    });

    if (!jobSeeker) {
      return handleErrorResponse(
        res,
        statusCodes.NOT_FOUND,
        "Job seeker not found or not associated with this agency"
      );
    }

    // Update status
    jobSeeker.status = status;
    await jobSeeker.save();

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      messages.JOB_SEEKER_REQUEST_UPDATED,
      { jobSeeker }
    );
  } catch (error) {
    console.log(error);
    return handleErrorResponse(
      res,
      statusCodes.ERROR,
      messages.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  getAllAgencies,
  getJobSeekersByAgency,
  getCurrentUserProfile,
  getAgencyDetails,
  updateJobSeekerStatus,
};

