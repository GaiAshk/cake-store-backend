const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

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
mongoose.connect(config.db_dev, {useNewUrlParser : true});
mongoose.Promise = global.Promise;
console.log("connected to mongoose DB");

//mongoose.connect('mongodb://127.0.0.1:27017/login', {useNewUrlParser : true});

/////////// added and should be removed later
// Let any client request rest api calls
const allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-requested-with, authorization, Origin, Accept, auth-token");
  next();
};
app.use(allowCrossDomain);
//////////////////

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
