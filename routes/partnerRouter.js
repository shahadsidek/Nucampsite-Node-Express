const { application } = require('express');
const express = require('express');
const partnerRouter = new express.Router();

const Partner = require('../models/partner');
const authenticate = require('../authenticate');


partnerRouter.route('/')
    .get((req, res, next) => {
        Partner.find()
        .then(partners =>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partners);
        })
        .catch(err => next(err));
    })
    
    
    .post(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
        Partner.create(req.body)
        .then(partner =>{
            console.log('Partner Created', partner);
            req.statusCode=200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        })
        .catch(err => next(err));
    })


    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operations is not supported on /partners');
    })


    .delete(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
        Partner.deleteMany()
        .then(response => {
            req.statusCode = 200;
            res.setHeader('Content-Type' , 'application/json');
            res.json(response);
        })
        .catch( err => next(err));
    });




partnerRouter.route('/:partnerId')
    .get((req, res, next) => {
        Partner.findById(req.params.partnerId)
        .then(partner => {
            req.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        })
        .catch(err => next(err));
    })


    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation is not supported on  /partners/${req.params.partnerId}`);
    })


    .put(authenticate.verifyUser,authenticate.verifyAdmin, (req, res,next) => {
        Partner.findByIdAndUpdate(req.params.partnerId, {
            $set: req.body
        }, {
            new: true
        })
            .then(partner => {
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => next(err));
    })

    
    .delete(authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
        Partner.findByIdAndDelete(req.params.partnerId)
            .then(response => {
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

module.exports = partnerRouter;