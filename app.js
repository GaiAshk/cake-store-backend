const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

//security
//DOS anb DDOS
//helmet protects against known malicious headers in requests
const helmet = require('helmet');
//protects against brute force attacks with 2 rules
// Rule 1 Every request per user increments an internal count. When the count exceeds the limit, the requests are denied with a HTTP 429 Too Many Requests.
// Rule 2 The only way for count to go away, is for an internal expiration time to expire, called the expiry, and is measured in seconds. Every second, the expiry time will go down by one.
const Ddos = require('ddos');
const ddos = new Ddos({burst:10, limit:15});

//forgery attack CSRF (Cross-Site Request Forgery)
//I use JWTtoken as cookies which updates automaticly, so XSRF is not possible


//import of index and users
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// added from log in tutorial
const config = require('./config/config');
//const webpackConfig = require('./webpack.config');
const isDev = process.env.NODE_ENV !== 'production';
///

//connect to database
// Set up Mongoose
mongoose.connect(config.db_dev, {useNewUrlParser : true, useFindAndModify: false});
mongoose.Promise = global.Promise;
console.log("connected to mongoose DB");



// Let any client request rest api calls
const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-requested-with, authorization, Origin, Accept, auth-token");
  next();
};
app.use(allowCrossDomain);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//routes middleware
app.use('/', indexRouter);
app.use('/users', usersRouter);

//security
app.use(helmet());
app.use(ddos.express);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
