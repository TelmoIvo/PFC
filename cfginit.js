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
var db;
var flags

//variaveis globais
var mobile = {};
var objfile;

//Iniciar funcao principal
init();

//Ler do ficheiro e enviar para searchFilePile para percorrer a pilha
function init() {

    fs.readFile('log.log', 'utf8', function (err, source) {
        MongoClient.connect(url, function (err, database) {
            db = database;
            flags = db.collection('flags')
            objfile = JSON.parse(source);
            searchFilePile(objfile)
        })
    })
}

function searchFilePile(arrayfile) {
    do {
        searchMobilePile(arrayfile[0], cuMobilePile)
        break;
    } while (0 < arrayfile.length)
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
    Logger.info(document)
}

function insertMongo(document) {
    flags.insert(document, {safe: true}, function (err, result) {
        if (err) throw err;
        Logger.info("Insert| " + "VID: " + document.vid + " TMX: " + document.config.tmx)
        objfile.splice(0, 1)
        searchFilePile(objfile)

    })


}
function updateMongo(document) {
    flags.update({vid: document.vid}, {$set: {"config.tmx": document.tmx}}, {upsert: true}, function (err, result) {
        if (err) throw err;
        Logger.info("Update| " + "VID: " + document.vid + " TMX: " + document.tmx)
        objfile.splice(0, 1)
        searchFilePile(objfile)

    })

}