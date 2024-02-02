const httpStatus = require('http-status');
const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');
const db = require('../models/index');
const catchAsync = require('./catchAsync');
const config = require('../config/config');
const path = require('path');
const fs= require('fs');
const pathToKey = path.join(__dirname,'..', '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');
const jsonwebtoken = require('jsonwebtoken');
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
 * Hashes a password asynchronously using bcrypt.
 *
 * @param {string} password - The password to be hashed.
 * @returns {Promise<string>} - A Promise that resolves to the hashed password.
 */
const hashPassword = async (password) =>  {
    // Retrieve the salt rounds from the configuration
    const saltRounds = config.salt_length;
    console.log("salt round",saltRounds);
  
    // Generate the hash asynchronously using bcrypt
    return bcrypt
    .genSalt(Number(saltRounds))
    .then(salt => {
      console.log('Salt: ', salt)
      return bcrypt.hash(password, salt)
    });
};

/**
 * Generates a JSON Web Token (JWT) for the given user.
 *
 * @param {object} user - The user object for whom the JWT is issued.
 * @returns {object} - An object containing the generated JWT and its expiration time.
 */
function issueJWT(user) {
    // Extract user ID
    const userId = user._id;
  
    // Set the expiration time for the JWT (1 day)
    const expiresIn = '1d';
  
    // JWT payload
    const payload = {
      sub: userId,
      iat: Date.now(),
    };
  
    // Sign the JWT using RS256 algorithm and private key
    const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn, algorithm: 'RS256' });
  
    // Return the JWT and its expiration time
    return {
      token: `Bearer ${signedToken}`,
      expires: expiresIn,
    };
  }
  
module.exports = {
    isEmailTaken , hashPassword , issueJWT
};
