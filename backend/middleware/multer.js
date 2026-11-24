const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "resume") {
      cb(null, "public/resume");
    } else if (file.fieldname === "profileImage") {
      cb(null, "public/profileImage");
    } else {
      cb(null, "public");
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Create multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      // For profile images: PNG and JPEG only
      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = file.mimetype === "image/jpeg" || file.mimetype === "image/png";

      if (mimetype && extname) {
        cb(null, true);
      } else {
        cb(new Error("Profile image must be PNG or JPEG only!"));
      }
    } else if (file.fieldname === "resume") {
      // For resume: .docx and .pdf only
      const filetypes = /pdf|docx/;
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const allowedMimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      const mimetype = allowedMimes.includes(file.mimetype);

      if (mimetype && extname) {
        cb(null, true);
      } else {
        cb(new Error("Resume must be PDF or DOCX only!"));
      }
    } else {
      cb(new Error("Invalid file field!"));
    }
  },
});

module.exports = upload;


