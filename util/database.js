const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
require('dotenv').config();

const mongoConnect = (callback) => {
    MongoClient.connect(
        `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygqkk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
    ).then(result => {
        console.log('Connected to MongoDB');
        callback(result);
    }).catch(err => console.log(err));
}

module.exports = mongoConnect;