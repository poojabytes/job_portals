const messages = require("../utils/message.utils");
const statusCodes = require("../utils/status.code");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { sendOTPEmail } = require("../utils/sendMail");
const { generateToken } = require("../utils/token.service");
const { User, Agency, OTP } = require("../config/database").db;
const generateOTP = require("../utils/generateOTP");
const {
  handleSuccessResponse,
  handleErrorResponse,
} = require("../utils/response.util");

// Register user
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      userType,
      hobbies,
      agencyId,
      profileImage, // File path (filename) from upload endpoint
      resume, // File path (filename) from upload endpoint
    } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return handleErrorResponse(
        res,
        statusCodes.CONFLICT,
        messages.USER_ALREADY_EXISTS
      );
    }

    // If user type is Agency, create an Agency record
    if (userType === "Agency") {
      const existingAgency = await Agency.findOne({ where: { email: email.toLowerCase().trim() } });
      if (!existingAgency) {
        await Agency.create({
          name: `${firstName} ${lastName}`,
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
        });
      }
    }

    // Validate agency if user type is Job Seeker
    if (userType === "Job Seeker" && agencyId) {
      const agency = await Agency.findOne({ where: { uuid: agencyId } });
      if (!agency) {
        return handleErrorResponse(
          res,
          statusCodes.NOT_FOUND,
          messages.AGENCY_NOT_FOUND
        );
      }
    }

    // Extract filename from path if full path is provided, otherwise use as is
    // profileImage and resume should be just the filename (e.g., "1234567890.jpg")
    const profileImageFilename = profileImage
      ? profileImage.split('/').pop() // Extract filename from path if path provided
      : null;
    const resumeFilename = userType === "Job Seeker" && resume
      ? resume.split('/').pop() // Extract filename from path if path provided
      : null;

    // Create the user object
    const newUser = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      gender,
      userType,
      hobbies: hobbies || [],
      profileImage: profileImageFilename,
      resume: resumeFilename,
      agencyId: userType === "Job Seeker" ? agencyId : null,
    };

    // Save the user to the database
    const savedUser = await User.create(newUser);

    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({
      email: savedUser.email,
      otp,
      expiresAt,
    });

    await sendOTPEmail(
      savedUser.email,
      `${savedUser.firstName} ${savedUser.lastName}`,
      otp
    );

    return handleSuccessResponse(
      res,
      statusCodes.CREATED,
      messages.OTP_SENT_SUCCESSFULLY,
      {
        userId: savedUser.uuid,
        email: savedUser.email,
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

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      where: {
        email: email.toLowerCase().trim(),
        otp,
        isUsed: false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord) {
      return handleErrorResponse(
        res,
        statusCodes.NOT_FOUND,
        messages.INVALID_OTP
      );
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return handleErrorResponse(
        res,
        statusCodes.BAD_REQUEST,
        messages.EXPIRED_OTP
      );
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update user email verification status
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (user) {
      user.isEmailVerified = true;
      await user.save();
    }

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      messages.OTP_VERIFIED_SUCCESSFULLY,
      {
        email: user.email,
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

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return handleErrorResponse(
        res,
        statusCodes.NOT_FOUND,
        messages.USER_NOT_FOUND
      );
    }

    // Generate and send new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({
      email: user.email,
      otp,
      expiresAt,
    });

    await sendOTPEmail(user.email, `${user.firstName} ${user.lastName}`, otp);

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      messages.OTP_RESENT_SUCCESSFULLY,
      {
        email: user.email,
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

// Set Password
const setPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return handleErrorResponse(
        res,
        statusCodes.BAD_REQUEST,
        messages.PASSWORD_NOT_MATCH
      );
    }

    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user) {
      return handleErrorResponse(
        res,
        statusCodes.NOT_FOUND,
        messages.USER_NOT_FOUND
      );
    }

    if (!user.isEmailVerified) {
      return handleErrorResponse(
        res,
        statusCodes.BAD_REQUEST,
        "Please verify your email first"
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Update user password
    user.password = hashedPassword;
    user.isPasswordSet = true;
    await user.save();

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      messages.PASSWORD_SET_SUCCESSFULLY,
      {
        email: user.email,
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

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch the user from the database
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim(), isDeleted: false },
      include: [
        {
          model: Agency,
          as: "agency",
          attributes: ["uuid", "name", "email", "phone", "address"],
        },
      ],
    });

    if (!user) {
      return handleErrorResponse(
        res,
        statusCodes.NOT_FOUND,
        messages.USER_NOT_FOUND
      );
    }

    if (!user.isEmailVerified) {
      return handleErrorResponse(
        res,
        statusCodes.BAD_REQUEST,
        "Please verify your email first"
      );
    }

    if (!user.isPasswordSet) {
      return handleErrorResponse(
        res,
        statusCodes.BAD_REQUEST,
        "Please set your password first"
      );
    }

    // Compare the provided password with the stored password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return handleErrorResponse(
        res,
        statusCodes.UNAUTHORIZED,
        messages.INVALID_CREDENTIALS
      );
    }

    // Generate token
    const token = generateToken({
      id: user.uuid,
      email: user.email,
      userType: user.userType,
    });

    const userData = {
      uuid: user.uuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      userType: user.userType,
      hobbies: user.hobbies,
      profileImage: user.profileImage,
      resume: user.resume,
      status: user.status,
      agency: user.agency,
    };

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      messages.LOGIN_SUCCESSFUL,
      {
        user: userData,
        token,
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

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  setPassword,
  loginUser,
};

