var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');
//parameterizacao
var fs = require('fs');
var parameters = fs.readFileSync("param.json", "UTF-8");
var parameter = JSON.parse(parameters);

exports.ramoGPS = function (doc, mobile) {
    if (mobile[doc.vid].config.gps == undefined) {
        mobile[doc.vid].config.gps = {}

    }
    //Posicao GPS fixa ou 0,0
    if (mobile[doc.vid].config.ignON != undefined && mobile[doc.vid].config.ignON == true) {
        if ((doc.loc == mobile[doc.vid].config.loc) || (doc.loc.lat == 0.0 && doc.loc.lon == 0.0)) {
            if (mobile[doc.vid].config.canbflag == 1) {
                if ((doc.exd.gsp > 15 && doc.eco.rpm >= 900)) {
                    mobile[doc.vid].config.gps.gpsAnomali = true;
                }
            }
            else {
                if (doc.gsp > 15 || doc.gkm > mobile[doc.vid].config.gkm) {
                    mobile[doc.vid].config.gps.gpsAnomali = true;
                }
            }

        } else {
            //Condicao que guarda as coord de localizacao
            mobile[doc.vid].config.loc = doc.loc


        }
    }
}



