var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');
//parameterizacao
var fs = require('fs');
var parameters = fs.readFileSync("param.json", "UTF-8");
var parameter = JSON.parse(parameters);

exports.ramoTmp = function (doc, mobile) {
    //tpX flag - 0 devia existir; 1 existir;
    if (mobile[doc.vid].config.ignON != undefined && mobile[doc.vid].config.ignON == true) {
        if (doc.exd.tmp instanceof Object) {
            mobile[doc.vid].config.existFlagTmp = true;
            mobile[doc.vid].config.tmpflag = 1;

            if (mobile[doc.vid].config.tmp == undefined) {
                mobile[doc.vid].config.tmp = {}
            }

            if (doc.exd.tmp.tp1 != undefined) {
                if (mobile[doc.vid].config.tmp.tp1 == undefined) {
                    mobile[doc.vid].config.tmp.tp1 = {};
                }
                mobile[doc.vid].config.tmp.tp1.tpflag = 1
                mobile[doc.vid].config.tmp.tp1.tmp = doc.exd.tmp.tp1
            }
            if (doc.exd.tmp.tp2 != undefined) {
                if (mobile[doc.vid].config.tmp.tp2 == undefined) {
                    mobile[doc.vid].config.tmp.tp2 = {};
                }
                mobile[doc.vid].config.tmp.tp2.tpflag = 1
                mobile[doc.vid].config.tmp.tp2.tmp = doc.exd.tmp.tp2
            }
            if (doc.exd.tmp.tp3 != undefined) {
                if (mobile[doc.vid].config.tmp.tp3 == undefined) {
                    mobile[doc.vid].config.tmp.tp3 = {};
                }
                mobile[doc.vid].config.tmp.tp3.tpflag = 1
                mobile[doc.vid].config.tmp.tp3.tmp = doc.exd.tmp.tp3
            }
            if (doc.exd.tmp.tp4 != undefined) {
                if (mobile[doc.vid].config.tmp.tp4 == undefined) {
                    mobile[doc.vid].config.tmp.tp4 = {};
                }
                mobile[doc.vid].config.tmp.tp4.tpflag = 1
                mobile[doc.vid].config.tmp.tp4.tmp = doc.exd.tmp.tp4
            }

        }
        if (doc.exd.tmp instanceof Object) {
            if(mobile[doc.vid].config.tmp.tp1 && mobile[doc.vid].config.tmp.tp1.tpflag == 1 && (doc.exd.tmp.tp1 == undefined)) {
                TempValidation(doc, mobile[doc.vid].config.tmp.tp1);
            }
            if(mobile[doc.vid].config.tmp.tp2 && mobile[doc.vid].config.tmp.tp2.tpflag == 1 && (doc.exd.tmp.tp2 == undefined)) {
                TempValidation(doc, mobile[doc.vid].config.tmp.tp2);
            }
            if(mobile[doc.vid].config.tmp.tp3 && mobile[doc.vid].config.tmp.tp3.tpflag == 1 && (doc.exd.tmp.tp3 == undefined)) {
                TempValidation(doc, mobile[doc.vid].config.tmp.tp3);
            }
            if(mobile[doc.vid].config.tmp.tp4 && mobile[doc.vid].config.tmp.tp4.tpflag == 1 && (doc.exd.tmp.tp4 == undefined)) {
                TempValidation(doc, mobile[doc.vid].config.tmp.tp4);
            }
        }
    }
    if (!(doc.exd.tmp instanceof Object) && mobile[doc.vid].config.existFlagTmp == true) {
        mobile[doc.vid].config.tmpflag = 0;
        TempValidation(doc, mobile[doc.vid].config.tmp);

    }
}

function TempValidation(doc, obj) {
            if (obj.contadorTemp == undefined) {
                obj.contador = 0;
                obj.contadorTemp = [];
                obj.TmpAnomaly = 0;
                obj.counterTmp = 0;
                obj.TmpFlappingAnomaly = 0;
            }
            if (obj.contadorTemp == undefined) {
                obj.contador = 0;
                obj.contadorTemp = [];
                obj.TmpAnomaly = 0;
                obj.counterTmp = 0;
                obj.TmpFlappingAnomaly = 0;
            }
            obj.contadorTemp[obj.contador] = doc.tmx;
            obj.contador += 1;
            if (doc.tmx - obj.contadorTemp[0] > parameter.DeltaTimeTmp) {
                if (obj.contadorEventoTmp == undefined) {
                    obj.contadorEventoTmp = 0;
                }
                if (!obj.ArrayEventoTmp) {
                    obj.ArrayEventoTmp = []
                }

                if (obj.contador / (obj.config.countLogs - obj.counterTmp) >= parameter.TmpRatio) {
                    obj.ArrayEventoTmp[obj.contadorEventoTmp] = doc.tmx;
                    var auxeventotmx = (obj.ArrayEventoTmp[obj.contadorEventoTmp].getTime()
                    - obj.ArrayEventoTmp[0].getTime());
                    obj.contadorEventoTmp += 1;
                    if (auxeventotmx > 0 && auxeventotmx <= parameter.DeltaTimeTmp) {
                        obj.TmpAnomaly = 1;
                    }
                    else if (auxeventotmx > parameter.DeltaTimeTmp && auxeventotmx <= parameter.DeltaTimeTmpFlapping) {
                        obj.TmpFlappingAnomaly = 1;
                    }
                    else {
                        obj.ArrayEventoTmp.length = 0
                        obj.contadorEventoTmp = 0;
                        obj.ArrayEventoTmp[obj.contadorEventoTmp] = doc.tmx;
                        obj.contadorEventoTmp += 1
                    }
                } else {
                    obj.ArrayEventoTmp.length = 0
                    obj.contadorEventoTmp = 0;
                    obj.ArrayEventoTmp[obj.contadorEventoTmp] = doc.tmx;
                    obj.contadorEventoTmp += 1
                }
            }
}

/*
function TempValidation(doc, obj) {
    for (var prop in obj.config.tmp) {
        if (obj.config.tmp.hasOwnProperty(prop)) {
            var x = prop
            if (obj.config.tmp.prop == undefined) {
                obj.config.tmp.prop = {};
            }
            if (obj.config.tmp.prop.contadorTemp == undefined) {
                obj.config.tmp.prop.contador = 0;
                obj.config.tmp.prop.contadorTemp = [];
                obj.config.tmp.prop.TmpAnomaly = 0;
                obj.config.tmp.prop.counterTmp = 0;
                obj.config.tmp.prop.TmpFlappingAnomaly = 0;
            }
            if (obj.config.tmp.prop.contadorTemp == undefined) {
                obj.config.tmp.prop.contador = 0;
                obj.config.tmp.prop.contadorTemp = [];
                obj.config.tmp.prop.TmpAnomaly = 0;
                obj.config.tmp.prop.counterTmp = 0;
                obj.config.tmp.prop.TmpFlappingAnomaly = 0;
            }
            obj.config.tmp.prop.contadorTemp[obj.config.tmp.prop.contador] = doc.tmx;
            obj.config.tmp.prop.contador += 1;
            if (doc.tmx - obj.config.tmp.prop.contadorTemp[0] > parameter.DeltaTimeTmp) {
                if (obj.config.tmp.prop.contadorEventoTmp == undefined) {
                    obj.config.tmp.prop.contadorEventoTmp = 0;
                }
                if (!obj.config.tmp.prop.ArrayEventoTmp) {
                    obj.config.tmp.prop.ArrayEventoTmp = []
                }

                if (obj.config.tmp.prop.contador / (obj.config.countLogs - obj.config.tmp.prop.counterTmp) >= parameter.TmpRatio) {
                    obj.config.tmp.prop.ArrayEventoTmp[obj.config.tmp.prop.contadorEventoTmp] = doc.tmx;
                    var auxeventotmx = (obj.config.tmp.prop.ArrayEventoTmp[obj.config.tmp.prop.contadorEventoTmp].getTime()
                    - obj.config.tmp.prop.ArrayEventoTmp[0].getTime());
                    obj.config.tmp.prop.contadorEventoTmp += 1;
                    if (auxeventotmx > 0 && auxeventotmx <= parameter.DeltaTimeTmp) {
                        obj.config.tmp.prop.TmpAnomaly = 1;
                    }
                    else if (auxeventotmx > parameter.DeltaTimeTmp && auxeventotmx <= parameter.DeltaTimeTmpFlapping) {
                        obj.config.tmp.prop.TmpFlappingAnomaly = 1;
                    }
                    else {
                        obj.config.tmp.prop.ArrayEventoTmp.length = 0
                        obj.config.tmp.prop.contadorEventoTmp = 0;
                        obj.config.tmp.prop.ArrayEventoTmp[obj.config.tmp.prop.contadorEventoTmp] = doc.tmx;
                        obj.config.tmp.prop.contadorEventoTmp += 1
                    }
                } else {
                    obj.config.tmp.prop.ArrayEventoTmp.length = 0
                    obj.config.tmp.prop.contadorEventoTmp = 0;
                    obj.config.tmp.prop.ArrayEventoTmp[obj.config.tmp.prop.contadorEventoTmp] = doc.tmx;
                    obj.config.tmp.prop.contadorEventoTmp += 1
                }
            }
        }
    }
}
*/