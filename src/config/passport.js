const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const validPassword = require('../lib/passwordUtils').validPassword;
const { QueryTypes } = require('sequelize');
const db = require('../models/index');
const User = db.User;
const sequelize = db.sequelize;
// Define custom fields for username and password
const customFields = {
    usernameField: 'uname',
    passwordField: 'pw',
};

// Verification callback for LocalStrategy
const verifyCallback = async (uname, pw, done) => {
    try {
        const user = await User.findOne({
            where: { username: uname },
        });

        console.log("USER DATA"  + user.username);
        if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
        }

        const isValid = validPassword(pw, user.hash, user.salt);

        if (isValid) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password.' });
        }
    } catch (err) {
        return done(err);
    }
};

// Create a new instance of LocalStrategy
const strategy = new LocalStrategy(customFields, verifyCallback);

// Use the LocalStrategy with Passport
passport.use(strategy);

// Serialize user information for storing in the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user information from the session
passport.deserializeUser((userId, done) => {
    User.findByPk(userId)
        .then((user) => {
            done(null, user);
        })
        .catch((err) => {
            done(err);
        });
});

// Export Passport configuration
module.exports = passport;
