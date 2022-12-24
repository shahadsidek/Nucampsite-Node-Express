const express = require('express');
//^ WK -3 STEP(1) - Require the User Model
const User = require('../models/user');
const router = express.Router();
//^ WK - 2 - STEP (3) ~ adding the passport
// methods that are useful for registering and logging in users
const passport = require('passport');
//^ WK -3 - STEP (4) ~ require the authenticate module
const authenticate = require('../authenticate');


/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin,function (req, res, next) {
    User.find()
    .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    })
    .catch(err => next(err));
    });

//^ WK3 - STEP (2) - Creating another endpoint 
//allow a new user to register on the website
// pass a middleware function as an argument
// router.post('/signup', (req, res, next) => {
//     //the first thing we need to do to let the  user sign up into the system check that the username is not taken
//     User.findOne({ username: req.body.username })
//         .then(user => {
//             if (user) {
//                 const err = new Error(`User ${req.body.username} already exists!`);
//                 err.status = 403;
//                 return next(err);
//             } else {
//                 User.create({
//                     username: req.body.username,
//                     password: req.body.password
//                 })
//                     .then(user => {
//                         res.statusCode = 200;
//                         res.setHeader('Content-Type', 'application/json');
//                         res.json({ status: 'Registration Successful!', user: user });
//                     })
//                     .catch(err => next(err));
//             }
//         })
//         .catch(err => next(err));// for find one method if it returns a rejected promise
// });

router.post('/signup', (req, res) => {
    User.register(
        new User({username: req.body.username}),
        req.body.password,
        //if the registration is successful would contain the user document that was created
        (err, user) => {
            if (err) {
                //issue from the server side 
                res.statusCode = 500; 
                res.setHeader('Content-Type', 'application/json');
                // provide information on  the error porperty of the error obj
                res.json({err: err});
            } else {
                //to check if the first name was sent in the request body
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                //saving to the db
                user.save(err => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({err: err});
                        return;
                    }
                    passport.authenticate('local')(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({success: true, status: 'Registration Successful!'});
                    });
                });
            }
        }
    );
});


// checking if the user has logged in or not -- tracking for authenticated session
//after adding passport.authenticate will enable it on this route, if there is no error with this middleware then it will go to the next middleware method 
router.post('/login', passport.authenticate('local'), (req, res) => {
    //#region 
    //the passport authenticate will handle login in the user
    // if (!req.session.user) {// if there isnt a current session for this user- user not log in -- user must log 
    //     const authHeader = req.headers.authorization;
    //     // if no username and password is provided - then not authenticated
    //     if (!authHeader) {
    //         const err = new Error('You are not authenticated!');
    //         res.setHeader('WWW-Authenticate', 'Basic');
    //         err.status = 401;
    //         return next(err);
    //     }

    //     const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    //     const username = auth[0];
    //     const password = auth[1];

    //     //taking the username and password and checking it against the user document that we have
    //     // we will use the fidnone method on the users collection and check against the username field with the username given
    //     User.findOne({ username: username })
    //         .then(user => {
    //             if (!user) {// if no matching username and password
    //                 const err = new Error(`User ${username} does not exist!`);
    //                 err.status = 401;
    //                 return next(err);
    //             } else if (user.password !== password) {
    //                 const err = new Error('Your password is incorrect!');
    //                 err.status = 401;
    //                 return next(err);
    //             } else if (user.username === username && user.password === password) {
    //                 req.session.user = 'authenticated';
    //                 res.statusCode = 200;
    //                 res.setHeader('Content-Type', 'text/plain');
    //                 res.end('You are authenticated!')
    //             }
    //         })
    //         .catch(err => next(err));
    // } else { // there is a session already been tracked for the user -- client already logged in
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'text/plain');
    //     res.end('You are already authenticated!');
    // }
    //#endregion
    const token = authenticate.getToken({_id :req.user._id });   //the token we are passing it a payload - we will just include the id from the request object
    res.statusCode=200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true ,token, status: "You are successfully Logged in"})
});


router.get('/logout', (req, res, next) => {
    if (req.session) {// check if a session exists
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        const err = new Error('You are not logged in!');
        err.status = 401;
        return next(err);
    }
});


module.exports = router;
