
/**
 * Wraps an asynchronous function to catch any errors and pass them to the Express error handler.
 *
 * @param {Function} fn - The asynchronous function to be wrapped.
 * @returns {Function} - A new function that handles errors and passes them to the next middleware or error handler.
 */
const catchAsync = (fn) => (req, res, next) => {
  // Promise.resolve() ensures that the result of the asynchronous function is always a Promise.
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
