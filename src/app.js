const express = require('express');
const session = require('express-session');
const passport = require('passport');
const xss = require('xss-clean');
const { sequelize: db } = require('./models'); // Assuming 'db' was a typo and you meant 'database'
const MySQLStore = require('express-mysql-session')(session);
const app = express();
const config = require('./config/config');
const { errorConverter, errorHandler } = require('./middlewares/error');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const httpStatus = require('http-status');
const morgan = require('./config/morgan');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const ApiError = require('./utils/ApiError');
// const routes = require('./routes/v1');

// const routes = require('./routes/v1');
require('./config/passport')(passport);


if (config.env !== 'test') {
    app.use(morgan.successHandler);
    app.use(morgan.errorHandler);
}

let dbOptions;

if (config.env !== 'development') {
    const productionDatabaseConfig = config.database.production;
    dbOptions = {
        connectionLimit: 10,
        createDatabaseTable: true,
        host: productionDatabaseConfig.host,
        port: 3306,
        user: productionDatabaseConfig.username,
        password: productionDatabaseConfig.password,
        database: productionDatabaseConfig.database,
    };
} else {
    const developmentDatabaseConfig = config.database.development;
    dbOptions = {
        connectionLimit: 10,
        createDatabaseTable: true,
        host: developmentDatabaseConfig.host,
        port: 3306,
        user: developmentDatabaseConfig.username,
        password: developmentDatabaseConfig.password,
        database: developmentDatabaseConfig.database,
    };
}

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// sanitize request data
app.use(xss());

// enable cors
app.use(cors());
app.options('*', cors());



// Create a Sequelize instance
const sequelize = db.sequelize;

// Configure the MySQLStore for session management
const sessionStore = new MySQLStore(dbOptions);

// Configure Express to use sessions
app.use(
    session({
        key: config.session_name,
        secret: config.session_secret,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            // maxAge: config.cookeies_max_age,
            // sameSite: true,
            secure: config.env === 'production'
        }
    })
);

// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});


// Example: Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
    app.use('/v1/auth', authLimiter);
  }
  

// v1 api routes
// app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
    next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});


// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port} and database  is running on port no 3306`);
});


module.exports = app;