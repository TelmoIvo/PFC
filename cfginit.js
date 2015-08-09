var fs = require('fs');
var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var logger = log4js.getLogger('configAuto');

MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    url = 'mongodb://localhost:27017/pfc';

MongoClient.connect(url, function (err, db) {
    run(db);
});


function run(db) {
    fs.readFile('log.log', 'utf8', function (err, source) {
        if (err) throw err;
        var dataFile = JSON.parse(source);
        dataFile.forEach(function (item) {
            upsert(db, item, function (err, result) {
                if (err) console.dir(err);

            });
        });
    })
}

function upsert(db, doc, callback) {

    db.collection('flags').findOne({vid: doc.vid}, function (err, item, result) {

        if (item.vid != null) {
            if (!(item.tmx instanceof Date)) {
                item.tmx = new Date(item.tmx)
            }
            if(!(doc.tmx instanceof Date)){
                doc.tmx = new Date(doc.tmx)
            }

            if (item.tmx < doc.tmx) {
                console.dir("Date validation")
                db.collection('flags').updateOne({vid: item.vid}, {
                        $set: {
                            "tmx": doc.tmx
                        }
                    },{upsert:true}, function (err, result) {
                        callback(err, result);

                    }
                )

                callback(err, result);
            }
            else{
                console.dir("older")
                callback(err, result);
            }
        }
        else {
            db.collection('flags').insertOne(doc, function(err, result) {
                callback(err, result);
            });
        }
    })}

