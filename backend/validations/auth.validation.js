const Joi = require("joi");

const registerJoiSchema = {
  body: Joi.object().keys({
    firstName: Joi.string().required().messages({
      "string.empty": "First name is required",
      "any.required": "First name is required",
    }),
    lastName: Joi.string().required().messages({
      "string.empty": "Last name is required",
      "any.required": "Last name is required",
    }),
    email: Joi.string()
      .email()
      .message("Please enter a valid email")
      .required()
      .messages({
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),
    phone: Joi.string()
      .pattern(/^[0-9]+$/)
      .message("Phone must contain numbers only")
      .required()
      .messages({
        "string.empty": "Phone is required",
        "any.required": "Phone is required",
      }),
    gender: Joi.string()
      .valid("male", "female", "other")
      .required()
      .messages({
        "any.only": "Gender must be male, female, or other",
        "any.required": "Gender is required",
      }),
    userType: Joi.string()
      .valid("Job Seeker", "Agency")
      .required()
      .messages({
        "any.only": "User type must be Job Seeker or Agency",
        "any.required": "User type is required",
      }),
    hobbies: Joi.array()
      .items(Joi.string().valid("Sports", "Dance", "Reading", "Singing"))
      .optional()
      .messages({
        "array.includes": "Invalid hobby selected",
      }),
    agencyId: Joi.string()
      .uuid()
      .optional()
      .messages({
        "string.guid": "Invalid agency ID",
      }),
    profileImage: Joi.string()
      .optional()
      .allow(null, "")
      .messages({
        "string.base": "Profile image must be a valid file path",
      }),
    resume: Joi.string()
      .optional()
      .allow(null, "")
      .messages({
        "string.base": "Resume must be a valid file path",
      }),
  }).unknown(true),
};

const verifyOTPJoiSchema = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .message("Please enter a valid email")
      .required(),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .message("OTP must be a 6-digit number")
      .required(),
  }),
};

const resendOTPJoiSchema = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .message("Please enter a valid email")
      .required(),
  }),
};

const setPasswordJoiSchema = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .message("Please enter a valid email")
      .required(),
    password: Joi.string()
      .min(6)
      .max(30)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
        )
      )
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters long.",
        "string.max": "Password must not exceed 30 characters.",
        "string.pattern.base":
          "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
        "any.required": "Password is required.",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Confirm password must match password.",
        "any.required": "Confirm password is required.",
      }),
  }),
};

const loginJoiSchema = {
  body: Joi.object().keys({
    email: Joi.string()
      .email()
      .message("Please enter a valid email")
      .required(),
    password: Joi.string().required(),
  }),
};

const updateJobSeekerStatusSchema = {
  body: Joi.object().keys({
    userId: Joi.string().uuid().required().messages({
      "string.guid": "Invalid user ID",
      "any.required": "User ID is required",
    }),
    status: Joi.string()
      .valid("accepted", "declined")
      .required()
      .messages({
        "any.only": "Status must be accepted or declined",
        "any.required": "Status is required",
      }),
  }),
};

module.exports = {
  registerJoiSchema,
  verifyOTPJoiSchema,
  resendOTPJoiSchema,
  setPasswordJoiSchema,
  loginJoiSchema,
  updateJobSeekerStatusSchema,
};


