var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var ajaxRouter = require('./routes/ajax');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');

const Auth = require('./module/auth'),
    requireLogin = require('./middleware/requireLogin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('./middleware/nodeStatic'));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * bejelentkezést ellenőrízése
 */
app.use((req, res, next) => {
  res.locals.authenticated = Auth.isAuthenticated(req, res);
  res.locals.user = Auth.getInfo(req, res);
  next();
});

app.all('/admin/*', requireLogin);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/ajax', ajaxRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

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
