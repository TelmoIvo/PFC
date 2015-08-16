//Ficheiro
var fs = require('fs');

//Datas
var moment = require('moment');

//Logs
var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');

//MongoDB
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var url = 'mongodb://127.0.0.1:27017/pfc';

//variaveis globais
var mobile = {};
var objfile;

//Iniciar funcao principal
init();

//Ler do ficheiro e enviar para searchFilePile para percorrer a pilha
function init() {

    fs.readFile('log.log', 'utf8', function (err, source) {
        objfile = JSON.parse(source);
        searchFilePile(objfile)
    })
}

function searchFilePile(arrayfile) {
    do  {
        searchMobilePile(arrayfile[0], cuMobilePile)
        break;
    }while(0 < arrayfile.length)
}


function searchMobilePile(filedocument, callback) {
    if (!mobile[filedocument.vid]) {
        mobile[filedocument.vid] = {vid: filedocument.vid, config: {tmx: filedocument.tmx}}
        callback(mobile[filedocument.vid], insertMongo)

    }
    else {
        if (mobile[filedocument.vid].config.tmx < filedocument.tmx)
            callback(filedocument, updateMongo)
    }
}
function cuMobilePile(document, callback) {
    callback(document)
}

function insertMongo(document) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.dir("Connected correctly to server");
        db.collection('flags').insert(document, {safe: true}, function (err, result) {
            if (err) throw err;
            Logger.info("Insert| " + "VID: " + document.vid + " TMX: " + document.config.tmx)
            db.close()
            console.dir("Disconnected correctly to server");
            objfile.splice(0, 1)
            searchFilePile(objfile)

        })
    })

}
function updateMongo(document) {
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.dir("Connected correctly to server");
        db.collection('flags').update({vid: document.vid}, {$set: {"config.tmx": document.tmx}}, {upsert: true}, function (err, result) {
            if (err) throw err;
            db.close()
            Logger.info("Update| " + "VID: " + document.vid + " TMX: " + document.tmx)
            console.dir("Disconnected correctly to server");
            objfile.splice(0, 1)
            searchFilePile(objfile)

        })
    })

}