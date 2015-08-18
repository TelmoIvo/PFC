//Ficheiro
var fs = require('fs');

//Datas
var moment = require('moment');

//Logs
var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');
var _ = require('underscore')

//MongoDB
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var url = 'mongodb://127.0.0.1:27017/pfc';
var db;
var flags

//variaveis globais
var mobile = {};
var objfile;
var ecoflag;
var tmpflag;
var casflag;

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
    while (arrayfile.length > 0) {
        console.dir("Iterate")
        searchMobilePile(arrayfile[0], cuMobilePile)
        break;
    }
}

function searchMobilePile(filedocument, callback) {
    console.dir("Search Mobile")
    if (!mobile[filedocument.vid]) {
        console.dir("Search Mobile - Non Existing")
        mobile[filedocument.vid] = {vid: filedocument.vid, config: {tmx: filedocument.tmx}}
        callback(updateFlags(filedocument), insertMongo)
    }

    else if (mobile[filedocument.vid].config.tmx < filedocument.tmx) {
        console.dir("Search Mobile - Existing")
        mobile[filedocument.vid].config.tmx = filedocument.tmx
        callback(updateFlags(filedocument), updateMongo)
    }
    else {
        console.dir("Older")
        objfile.splice(0, 1)
        searchFilePile(objfile)
        return
    }
}
function cuMobilePile(document, callback) {
    console.dir("Create/Update")
    callback(document)
}

function insertMongo(document) {
    console.dir("Insert")
    flags.insert(document, {safe: true}, function (err, result) {
        if (err) throw err;
        Logger.info("Insert| " + JSON.stringify(document))
        objfile.splice(0, 1)
        searchFilePile(objfile)

    })


}
function updateMongo(document) {
    console.dir("Update")
    flags.update({vid: document.vid}, document, {upsert: true}, function (err, result) {
        if (err) throw err;
        Logger.info("Update| " + JSON.stringify(document))
        objfile.splice(0, 1)
        searchFilePile(objfile)

    })

}

function updateFlags(doc) {
    var existFlagEco = mobile[doc.vid].config.existFlagEco;
    var existFlagTmp = mobile[doc.vid].config.existFlagTmp;

    //Condição de verificação do modulo de ECO
    if (doc.exd.eco instanceof Object) {

        existFlagEco = {existFlagEco: true};
        console.dir(existFlagEco)
        ecoflag = {ecoflag: 1};

    } else {
        if (existFlagEco instanceof Object) {
            ecoflag = {ecoflag: 0};
        }
    }

    //Condição de verificação da existencia do modulo de TMP
    if (doc.exd.tmp instanceof Object) {
        existFlagTmp = {existFlagTmp: true};
        tmpflag = {tmpflag: 1};

    } else {
        if (existFlagTmp instanceof Object) {
            tmpflag = {tmpflag: 0};
        }
    }

    //Condição de verificação do CAS (estado do GPS)
    if (doc.cas == 5) {

        casflag = {casflag: true};
    } else {

        casflag = {casflag: false};
    }

    //variavel final que faz o merge das flags com a variavel Mobile
    var extend = _.extend(mobile[doc.vid].config, ecoflag, tmpflag, casflag, existFlagEco, existFlagTmp);
    return mobile[doc.vid];
}