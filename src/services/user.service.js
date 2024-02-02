const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const { isEmailTaken , hashPassword , issueJWT } = require('../utils/helper');

/**
 * Creates a new user after checking if the email is available.
 *
 * @param {Object} userBody - The user data to be used for creating the user.
 * @returns {Promise<User>} - A promise that resolves to the created user.
 * @throws {ApiError} - Throws an error if the email is already taken.
 */
const createUser = async (userBody) => {
    const { email,password } = userBody;

    // Check if the email is already taken
    const isTaken = await isEmailTaken(email);

    if (isTaken) {
        return {
            success: false,
            message: 'Email already taken',
        };
    }

    const hashedPassword = await hashPassword(password);
    const userData = User.create({ email : email , password :  hashedPassword });
    if(userData)
    {
        JWTToken = await issueJWT(userData);
    }
 
    let result = [ ...userData , JWTToken]
    return {
        success: true,
        user: result, // You can include the created user in the response if needed
        message: 'User created successfully',
    };
};

module.exports = {
    createUser,
};
