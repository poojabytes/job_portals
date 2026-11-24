const messages = require("../utils/message.utils");
const statusCodes = require("../utils/status.code");
const {
  handleSuccessResponse,
  handleErrorResponse,
} = require("../utils/response.util");

// Upload files (profile image and resume)
const uploadFiles = async (req, res) => {
  try {
    const uploadedFiles = {};

    // Handle profile image upload
    if (req.files?.profileImage && req.files.profileImage[0]) {
      const profileImageFile = req.files.profileImage[0];
      uploadedFiles.profileImage = {
        filename: profileImageFile.filename, // Use this in register API
        path: `/public/profileImage/${profileImageFile.filename}`,
        url: `${req.protocol}://${req.get("host")}/public/profileImage/${profileImageFile.filename}`, // Use this to render the image
      };
    }

    // Handle resume upload
    if (req.files?.resume && req.files.resume[0]) {
      const resumeFile = req.files.resume[0];
      uploadedFiles.resume = {
        filename: resumeFile.filename, // Use this in register API
        path: `/public/resume/${resumeFile.filename}`,
        url: `${req.protocol}://${req.get("host")}/public/resume/${resumeFile.filename}`, // Use this to render/download the PDF
      };
    }

    // Check if at least one file was uploaded
    if (Object.keys(uploadedFiles).length === 0) {
      return handleErrorResponse(
        res,
        statusCodes.BAD_REQUEST,
        "No files were uploaded. Please upload at least one file (profileImage or resume)."
      );
    }

    return handleSuccessResponse(
      res,
      statusCodes.OK,
      "Files uploaded successfully",
      { files: uploadedFiles }
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
  uploadFiles,
};

