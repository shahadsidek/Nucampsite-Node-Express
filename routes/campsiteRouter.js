//^ STEP (1): Require Express in this module
const express = require('express');

//^ STEP (2) : Create a new express router 
// this will give us a campsiteRouter object that we can use with express routing method
const campsiteRouter = express.Router();

//^ STEP (6) : importing/require the Campsite module 
const Campsite = require('../models/campsite');

//^WK3
const authenticate = require('../authenticate');


//^ STEP (4) :
    // .all((req, res, next) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'text/plain');
    //     next();
    // })
    //^ STEP (7):  we added the next function incase we run into an error
    //if we get a request to this endpoint it means that the client is asking us to send back data for all of the campsite
    campsiteRouter.route('/')
    .get((req, res, next) => {
        Campsite.find()
        //#region 
        //that when the campsite documents are retreived to populate the authors field of the comment sub-document by finding the user doc that matches the object id that is stored there  
        //#endregion
        .populate('comments.author')
        .then(campsites => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(campsites); // will send Json data to the client in the response stream and then will automatically close the response stream so we dotn need dont end anymore
        })
        .catch(err => next(err)); 
        //#region 
        // this will pass thew error to the overall error handler for this express and let express handle this error
        // res.end(" We will send all the campsite to you")
        //#endregion
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.create(req.body)
            .then(campsite => {
                console.log('Campsite Created: ', campsite);
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
            // res.end(`Will add the campsite : ${req.body.name} with description ${req.body.description}`);
    })
    .put(authenticate.verifyUser,(req, res) => {
        res.statusCode = 403;
        res.end('PUT operations is not supported on /campsites');
    })

    .delete(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
        Campsite.deleteMany()
            .then(response => {
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
        // res.end('Deleting all campsites');
    });


//^ STEP (5)
campsiteRouter.route('/:campsiteId')
    .get((req, res, next) => {
        // res.end(`We will send details of the campsite:${req.params.campsiteId} to you`);
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
            .then(campsite => {
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser,(req, res) => {
        res.statusCode = 403;
        res.end(`POST operation is not supported on  /campsites/${req.params.campsiteId}`);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
        //#region 
        // res.write(`Updating the campsite : ${req.params.campsiteId}\n`);
        // res.end(`we will update the campsite ${req.body.name} with description ${req.body.description}`);
        //#endregion
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, {
            new: true
        })
            .then(campsite => {
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
        // res.end(`Deleting campsite: ${req.params.campsiteId}`);
    });


    campsiteRouter.route('/:campsiteId/comments')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
        .then(campsite => {
            if (campsite) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite.comments);
            } else {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite) {
                req.body.author = req.user._id;
                campsite.comments.push(req.body);
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite) {
                for (let i = (campsite.comments.length-1); i >= 0; i--) {
                    campsite.comments.id(campsite.comments[i]._id).remove();
                }
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
            } else {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    });
    
    campsiteRouter.route('/:campsiteId/comments/:commentId')
    .get((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite.comments.id(req.params.commentId));
            } else if (!campsite) {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    })
    .post(authenticate.verifyUser,authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
                if ((campsite.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                    if (req.body.rating) {
                        campsite.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    if (req.body.text) {
                        campsite.comments.id(req.params.commentId).text = req.body.text;
                    }
                    campsite.save()
                    .then(campsite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(campsite);
                    })
                    .catch(err => next(err));
                }else{
                    err = new Error('You are not authorized to delete this comment');
                    err.status = 403;
                }
            }
            else if (!campsite) {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    })
    .delete(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
                if ((campsite.comments.id(req.params.commentId).author._id).equals(req.user._id)) {
                    campsite.comments.id(req.params.commentId).remove();
                    campsite.save()
                    .then(campsite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(campsite);
                    })
                    .catch(err => next(err));
                }else {
                    err = new Error('You are not authorized to delete this comment');
                    err.status = 403;
                    return next(err);
                } 
            }else if (!campsite) {
                err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    });

//^ STEP (3) Export the campsiteRouter
module.exports = campsiteRouter;
