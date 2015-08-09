var fs = require('fs');
var flags = require("./cfginit.js");
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var async = require('async');

var url = 'mongodb://localhost:27017/pfc';
var obj;
MongoClient.connect(url, function (err, db) {
    assert.equal(null, err);
    //insercao e actualizacao
    flags.init(db);


});
