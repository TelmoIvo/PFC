var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');
//parameterizacao
var fs = require('fs');
var parameters = fs.readFileSync("param.json", "UTF-8");
var parameter = JSON.parse(parameters);

exports.ramoTmp = function (doc, mobile) {
    if (mobile[doc.vid].config.ignON != undefined && mobile[doc.vid].config.ignON == true) {
        if (doc.exd.tmp instanceof Object) {
            mobile[doc.vid].config.existFlagTmp = true;
            mobile[doc.vid].config.tmpflag = 1;
            if (mobile[doc.vid].config.tmp == undefined) {
               mobile[doc.vid].config.tmp = {}
            }
            if(mobile[doc.vid].config.tmp.tp1){

            }
            if(mobile[doc.vid].config.tmp.tp2){

            }
            if(mobile[doc.vid].config.tmp.tp3){

            }
            if(mobile[doc.vid].config.tmp.tp4){

            }
        }
        if (!(doc.exd.tmp instanceof Object) && mobile[doc.vid].config.existFlagTmp == true) {
            mobile[doc.vid].config.tmpflag = 0;
        }


    }
}