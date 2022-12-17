//^ STEP (1): Require Express in this module
const express = require('express');

//^ STEP (2) : Create a new express router 
// this will give us a campsiteRouter object that we can use with express routing method
const campsiteRouter = express.Router();

//^ STEP (6) : importing/require the Campsite module 
const Campsite = require('../models/campsite');

//^ STEP (4) :
campsiteRouter.route('/')
    // .all((req, res, next) => {
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'text/plain');
    //     next();
    // })
    //^ STEP (7):  we added the next function incase we run into an error
    //if we get a request to this endpoint it means that the client is asking us to send back data for all of the campsite
    .get((req, res, next) => {
        Campsite.find()
            .then(campsites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsites); // will send Json data to the client in the response stream and then will automatically close the response stream so we dotn need dont end anymore
            })
            .catch(err => next(err)); // this will pass thew error to the overall error handler for this express and let express handle this error
        // res.end(" We will send all the campsite to you")
    })
    .post((req, res, next) => {
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
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operations is not supported on /campsites');
    })

    .delete((req, res, next) => {
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
            .then(campsite => {
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation is not supported on  /campsites/${req.params.campsiteId}`);
    })
    .put((req, res, next) => {
        // res.write(`Updating the campsite : ${req.params.campsiteId}\n`);
        // res.end(`we will update the campsite ${req.body.name} with description ${req.body.description}`);
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
    .delete((req, res, next) => {
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
    .post((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite) {
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
    .put((req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete((req, res, next) => {
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
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .put((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
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
    .delete((req, res, next) => {
        Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite && campsite.comments.id(req.params.commentId)) {
                campsite.comments.id(req.params.commentId).remove();
                campsite.save()
                .then(campsite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite);
                })
                .catch(err => next(err));
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
    });

//^ STEP (3) Export the campsiteRouter
module.exports = campsiteRouter;