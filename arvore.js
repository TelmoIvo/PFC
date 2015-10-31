var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');
//parameterizacao
var fs = require('fs');
var parameters = fs.readFileSync("param.json", "UTF-8");
var parameter = JSON.parse(parameters);
//ramos
var treeGPS = require('./RamoGPS.js')
var treeCAS = require('./RamoCAS.js')
var treeECO = require('./RamoECO.js')
var treeCANB = require('./RamoCANB.js')
var treeTMP = require('./RamoTMP.js')

exports.ramoGPS = function (doc, mobile) {
    treeGPS.ramoGPS(doc, mobile)
}

exports.ramoCas = function (doc, mobile){
    treeCAS.ramoCas(doc, mobile)
    }

exports.ramoEco = function (doc, mobile){
    treeECO.ramoEco(doc, mobile)
    }

exports.ramoCANB = function (doc, mobile) {

    treeCANB.ramoCANB(doc, mobile)
}

exports.ramoTmp = function (doc, mobile) {
    treeTMP.ramoTmp(doc, mobile)
}