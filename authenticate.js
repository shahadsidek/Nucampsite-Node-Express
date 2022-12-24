const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user'); // has access to the passport local mongoose

const JwtStrategy = require('passport-jwt').Strategy;// to authenticate endpoints using JSON web token
const ExtractJwt = require('passport-jwt').ExtractJwt; // object that will provide us with several helper methods one of which is used to extract the jwt token from a request object
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const config = require('./config');
const { secretKey } = require('./config');
const user = require('./models/user');

//#region 
//the local strategy required a verified callback function ~ that will verify the username and password against the locally stored usernames and pwds
// passport support token based authentivation and session based authentication
// when we do session authentication we need to perform serialization to the user and deserialization. 
//when the user is verified the user data must be grabbed from the session and added to the request object
//serialization means: when we receive data from the user object and we need to convert it to the store then serialization need to happen
//#endregion
exports.local = passport.use(new LocalStrategy(User.authenticate())); // adding the strategy plugin
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//^ Exports for the token authentication
// first is a function that receives an object (user)
//the user will contain an id for the user document
// it will return a token created by jwt.sign
//the sign method will take the user object that was passed in as the first argument
//the second argument comes from the config module
//third argument option - configure the token to expire
exports.getToken = user => {
    return jwt.sign(user, secretKey, {expiresIn: 3600});
};

//^ Configuring the json web token strategy
//setting the property for opts
//first how the json web token should be extracted from the incoming request method
//a json web token can be sent from the client in various ways |request header, or in the request body , url query parameter|
//--secretOrKey--set the jwt strategy with a key which we will assign this token 
// it will be set as config reset key property in config.js
const opts = {};
opts.jwtFromRequest= ExtractJwt.fromAuthHeaderAsBearerToken();// the method here is header
opts.secretOrKey = config.secretKey;

//^ Exporting the  JWT strategy 
exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        //---done ---is a passport error first callback accepting arguments done(error, user, info)
        //The ---findOne()--- function is used to find one document according to the condition. If multiple documents match the condition, then it returns the first document satisfying the condition.
        // find a user with the same id as in the token
        //if ----there is an error no user found---- we will send it to done taking false as a second argument saying that no user was found
        //if the ---user is found --- we will send a null the first argument for done --err-- meaning no error was found and also send the user argument as the 2nd argument then passport will use this done callback  to access the user document so that it can load information from it to the request object.
        //done is a callback that is written in the passport-jwt module
        //the third else is that no error is found but no user id match the user id in the token, the second argument which is false it measn that no user was found
        (jwt_payload, done) => {
            console.log('JWT payload:', jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) { 
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        }
    )
);

exports.verifyAdmin = (req,res,next) => {
    if(req.user.admin === true){
        return next()
    }else{
        err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        return next(err);
    }
}

//#region 
// verify that an incoming request is from a verified user
// the first argument to say that we want to use the json web token strategy
// the second argument states that we are not using sessions
//#endregion

exports.verifyUser = passport.authenticate('jwt', {session: false});