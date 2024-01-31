const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

/**
 * Converts non-ApiError errors to ApiError instances.
 *
 * @param {Error} err - The error to be converted.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 */
const errorConverter = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError errors to ApiError instances
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};

/**
 * Handles errors and sends an appropriate response to the client.
 *
 * @param {Error} err - The error to be handled.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next function.
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Override status code and message for non-operational errors in production
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  // Store error message in res.locals for further processing if needed
  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  // Log error in development environment
  if (config.env === 'development') {
    logger.error(err);
  }

  // Send the response to the client
  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
