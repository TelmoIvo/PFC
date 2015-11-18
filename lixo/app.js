var express = require('express');

// Mongoose import
var mongoose = require('mongoose');

// Mongoose connection to MongoDB (ted/ted is readonly)
mongoose.connect('mongodb://localhost/pfc', function (error) {
    if (error) {
        console.log(error);
    }
});

// Mongoose Schema definition
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    cas: Number,
});

// Mongoose Model definition
var User = mongoose.model('logs', UserSchema);

// Bootstrap express
var app = express();

// URLS management

app.get('/', function (req, res) {
    res.send("<a href='/users'>Show Users</a>");
});

app.get('/users', function (req, res) {
    User.find({'cas':5}, function (err, docs) {
        res.json(docs);
    });
});


// Start the server
app.listen(80);
