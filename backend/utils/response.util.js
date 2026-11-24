exports.handleSuccessResponse = function (res, statusCode, message, data = {}) {
  return res.status(statusCode).json({ statusCode, message, data });
};

exports.handleErrorResponse = function (res, statusCode = 500, error) {
  return res.status(statusCode).json({ statusCode, message: error });
};


