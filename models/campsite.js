// (1) -- import and require Mongoose
const mongoose = require('mongoose');

//(2) -- making a shorthand to the mangoose schema function
//MongoDB is a schema-less NoSQL document database. It means you can store JSON documents in it, and the structure of these documents can vary as it is not enforced like SQL databases. This is one of the advantages of using NoSQL as it speeds up application development and reduces the complexity of deployments.
const Schema = mongoose.Schema;

// (7) -- adding the mongoose-currency
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

//(6) -- adding a new schema
const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// (3) -- Instantiating a new object names Campsite Schema
// -- The first argument is an object which is the definition of the schema 
// -- The second argument is options - used ot set various options
// -- The timestamps : will cause mongoose to automatically add 2 props created at and updated at
const campsiteSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    elevation: {
        type: Number,
        required: true
    },
    cost: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    comments: [commentSchema]
}, {
    timestamps: true
}
);

//(4) -- Creating a modal 
// -- Remember first letter should be capital and the in singular format
// -- The first argument is what we want to name the model 
// -- The 2nd arg is the schema that we want to use 
// -- The return value of mongoose.model is a constructor function
// -- the modal is used to instantiate documents for mongodb
const Campsite = new mongoose.model('Campsite', campsiteSchema);

// (5) -- export 
module.exports = Campsite;