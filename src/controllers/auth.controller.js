const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const ApiCommonResponse = require('../utils/ApiCommonResponse');
const ApiError = require('../utils/ApiError');

/**
 * Controller function for user registration.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const register = catchAsync(async (req, res) => {
  const { body } = req;

  // Attempt to create a new user using the userService
  const registrationResult = await userService.createUser(body);

  console.log(registrationResult.success);

  // Check the result of user creation and send appropriate response
  if (registrationResult.success) {
    // If user creation is successful, send a 201 Created response   
    // Create an instanceaaa of ApiSuccess
    const successResponse = new ApiCommonResponse(httpStatus.OK, registrationResult.message, registrationResult.user);
    
    res.status(httpStatus.CREATED).json(successResponse);
  } else {

    // If user creation failed (e.g., email already taken), send a 400 Bad Request response
    const errorResponse = new ApiCommonResponse(httpStatus.NOT_ACCEPTABLE, registrationResult.message);
    res.status(httpStatus.BAD_REQUEST).json(errorResponse);
  }
});

module.exports = {
  register
};