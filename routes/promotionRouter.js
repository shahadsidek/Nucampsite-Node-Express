// STEP 1 : Require Express
const express = require('express');

// STEP 2: Set up the Router
const promotionRouter = express.Router();

const Promotion = require('../models/promotion');
// STEP 3 : adding routes to promotions and promotionsId
promotionRouter.route('/')
    .get((req, res, next) => {
        Promotion.find()
        .then(promotions =>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotions);
        })
        .catch(err => next(err));
    })

    
    .post((req, res, next) => {
        Promotion.create(req.body)
        .then(promotion =>{
            console.log('Promotion Created', promotion);
            req.statusCode=200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promotion);
        })
        .catch(err => next(err));
    })



    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operations is not supported on /promotions');

    })



    .delete((req, res, next) => {
        Promotion.deleteMany()
        .then(response => {
            req.statusCode = 200;
            res.setHeader('Content-Type' , 'application/json');
            res.json(response);
        })
        .catch( err => next(err));
    });



promotionRouter.route('/:promotionId')
.get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
    .then(promotion => {
        req.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    })
    .catch(err => next(err));
})


    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation is not supported on  /promotions/${req.params.promotionId}`);
    })


    .put((req, res,next) => {
        Promotion.findByIdAndUpdate(req.params.promotionId, {
            $set: req.body
        }, {
            new: true
        })
            .then(promotion => {
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promotion);
            })
            .catch(err => next(err));
    })



    .delete((req, res, next) => {
        Promotion.findByIdAndDelete(req.params.promotionId)
            .then(response => {
                req.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });


module.exports = promotionRouter;