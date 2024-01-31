const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const db = require('../models/index');
const { User } = db;

/**
 * Checks if the email is already taken by an existing user in the database.
 *
 * @param {string} email - The email to be checked.
 * @returns {Promise<boolean>} - A promise that resolves to true if the email is taken, false otherwise.
 */
const isEmailTaken = async (email) => {
    const user = await User.findOne({
        where: {
            email: email,
        },
    });

    return !!user; // Returns true if the user with the given email exists, otherwise false
};

/**
 * Handles exceptions and returns an HTTP response with the appropriate status code and error message.
 *
 * @param {Error} error - The caught error.
 * @param {import('express').Response} res - The Express response object.
 */
const handleHttpException = (error, res) => {
    console.log(error);
    let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal Server Error';

    if (error instanceof ApiError) {
        // If it's a known ApiError, use its status code and message
        statusCode = error.statusCode;
        errorMessage = error.message;
    }

    res.status(statusCode).json({ error: errorMessage });
};

module.exports = {
    isEmailTaken,handleHttpException
};
