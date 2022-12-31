var createError = require('http-errors');
var express = require('express');
var path = require('path');
//^ WEEK 3 - (2) - Required for the Cookie 
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
//^ WEEK3 - (5) require the express session
// const session = require('express-session');
// const FileStore = require('session-file-store')(session);
// const authenticate = require('./authenticate');

//^WEEK3 - (6) requiring the passport
const passport = require('passport');
const config = require('./config');
const uploadRouter = require('./routes/uploadRouter');
//^ STEP (1)
//* after copying the files to the project directory we require the modules tobe able to use them 
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');
const favoriteRouter = require('./routes/favoriteRouter');

//^ STEP (3) : Connecting the express with the mongodb server - add the url of th emongodb server
// const url = 'mongodb://localhost:27017/nucampsite';
// the second argument to handle the deprecation warnings
const mongoose = require('mongoose');
const url = config.mongoUrl;
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//^ STEP (4) :  handle the promise that is returned from the connect method
connect.then(() => console.log("Successfully Connected to the Server"),
  err => console.log(err)
);

//^ STEP (5) : If the connect was not successful (step 4 the answer is in the 2nd arg)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { addAbortSignal } = require('stream');

var app = express();

//^WEEK (4)  - 
//catching everysinge path on our server 
// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
      console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
      res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
  }
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//^ WEEK 3 - (3) - Require for the Cookie 
// WK3 --- this is an example of signed cookie -  we will add a secret key which is a string and can be anything
// WK3 --- later we removed cookie parser when we added the express session as it will cause conflict
// app.use(cookieParser('1323-5462-5325-3536-9530'));
// app.use(session({
//   name: 'session-id',
//   secret: '1323-5462-5325-3536-9530',
//   saveUninitialized: false, // when new sessions are created but no new updates are made then at the end of request it wont get saved
//   resave: false,
//   store: new FileStore()
// }));
//^ WEEK (3) - STEP (1)
// we add the authentication here because must authenticate before accessign any pages from the server
// because auth is a middleware function it should have the req res and next paramters
//WK3 - (4) ---  the 1st time the user tries to access the server we will expect the user to send authentication credentials 
// -- so we will send a client a cookies and set it up on the server side so that the client can use that cookie

//^ WEEK3 - for using passport session authentication
//this is added after express sessions middleware
//these two middleware function check to see if there is an existing session for that client, if so the session data is loaded in the request
// app.use(passport.session());
app.use(passport.initialize());

app.use('/favorites', favoriteRouter);



app.use('/', indexRouter);
// WEEK 3 - this is created by express generator
app.use('/users', usersRouter);


// function auth(req, res, next){
//   console.log(req.user);
//   //#region 
//   //- the signedCookies method is provided by the cookie parser - it will automatically parse a signed cookie from the request
//   // -- the user properties is assigned by us 
//   // if (!req.signedCookies.user){
//   //#endregion
//   if(!req.user){ // if there is no req.user then there is no session loaded for that client
//     // const authHeader = req.headers.authorization; ~~~~~~ will be handled by user router
//     // if(!authHeader){ ~~~~~~ will be handled by user router
//     const err = new Error( 'You are not authenticated')
//     // res.setHeader('WWW-Authenticate', 'Basic');// that the server is requesting authentication and the authentication method requested is basic
//     err.status= 401; // standard err when credentials have not been provided is 401
//     return next(err); // we will pass the error message to express to handle sending thr error message to the client 
//     //#region 
//     // buffer is a method that we do not need to require it we just use it 
//     // the from method is used ot decode the username and password 
//     // const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//     // const user = auth[0];
//     // const pass = auth[1];
//     // if (user === 'admin' && pass === 'password') {
//     //   //^ Week 3--- (4) --- Setting up a cookie when the user enters the correct username and password
//     //   // the res.cookie is part of express response object API we will use it to create a new cookie by passing 
//     //   // the name we want to use 'user' and 2nd argument a value to store in the name property 
//     //   //third cvalue is an option - configuration values -
//     //   // by assigning the third value true ,we let express know to use the key we have passed in cookie parser to create a sign cookie
//     //   // res.cookie method handles creating the cookie and setting it up in the server's response to the client
//     //   // res.cookie('user', 'admin', {signed:true})
//     //   req.session.user ='admin';
//     //   return next(); // authorized
//     // } else {
//     //   const err = new Error('You are not authenticated!');
//     //   res.setHeader('WWW-Authenticate', 'Basic');
//     //   err.status = 401;
//     //   return next(err);
//     // }
//   //#endregion
//   } else{
//     //#region 
//     // we will simplify the line below after adding passport
//     // if(req.session.user ==='authenticated'){
//     // if(req.signedCookies.user==='admin'){
//     //#endregion
//       return next();// if correct we will pass the client to the next middleware function
//     }
//     //#region 
//     // else{
//     //   const err = new Error('You are not authenticated!');
//     //   err.status = 401;
//     //   return next(err);
//     // }
//     //#endregion
//   }
// app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));


//^ STEP 2
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

app.use('/imageUpload', uploadRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
