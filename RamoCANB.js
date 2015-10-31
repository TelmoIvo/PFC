var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');
//parameterizacao
var fs = require('fs');
var parameters = fs.readFileSync("param.json", "UTF-8");
var parameter = JSON.parse(parameters);

//Esta funcao verifica se a viatura tem a ignicao ligada/desligada.
//Comeca por verificar se a viatura tem "exd.io", e se tiver da preferencia a essa informacao sobre o estado da ignicao.
//Caso a viatura nao tenha "io" vai verificar o "cas" das viaturas ate encontrar um "cas" 60/61.

//@Param doc - Os dados que sao lidos directamente do streaming
//@Param mobile - Variavel de memoria, que e utilizada para guardar todos os dados importantes que vem do doc.
//				  Esta variavel e a que vai ser guardada numa coleccao mongo (flags)
//@Param ignON - Flag que guarda o valor da ignicao, se esta ligada/desligada

exports.ramoCANB = function (doc, mobile) {
    if (mobile[doc.vid].config.canb == undefined) {
        mobile[doc.vid].config.canb = {}
        mobile[doc.vid].config.canb.countParcial = 0;
        mobile[doc.vid].config.canb.countTotal = 0;
        mobile[doc.vid].config.canb.tflCount = 0;
    }
    //Leitura Intermitente
    if (mobile[doc.vid].config.canbflag != undefined && mobile[doc.vid].config.ignON) {

        mobile[doc.vid].config.canb.countTotal = mobile[doc.vid].config.canb.countTotal + 1;

        // if (mobile[doc.vid].config.canbflag == 0 && mobile[doc.vid].config.existCanb) {
        // mobile[doc.vid].config.canb.canbAnomaly = true
        // mobile[doc.vid].config.canb.countParcial = mobile[doc.vid].config.canb.countParcial + 1;
        // }

        //Parte do else que vai verificar os valores de CANBUS.
        /*
         Verifica as seguintes anomalias:
         -ckmAnomaly:
         -tflAnomaly:
         */
        if (mobile[doc.vid].config.canbflag == 1) {

            if (doc.exd.eco != undefined) {
                if ((doc.exd.eco.rpm >= parameter.rpmLimitValue && doc.gsp >= parameter.gspLimitValue)) {

                    if (mobile[doc.vid].config.eco.ckm != undefined && doc.exd.eco.ckm == mobile[doc.vid].config.eco.ckm) {
                        mobile[doc.vid].config.canb.ckmAnomaly = true;

                    } else {
                        mobile[doc.vid].config.eco.ckm = doc.exd.eco.ckm
                        if (mobile[doc.vid].config.canb.ckmAnomaly != undefined)
                            mobile[doc.vid].config.canb.ckmAnomaly = false;
                    }

                    if (mobile[doc.vid].config.eco.tfl != undefined && doc.exd.eco.tfl == mobile[doc.vid].config.eco.tfl) {
                        mobile[doc.vid].config.canb.tflCount = mobile[doc.vid].config.canb.tflCount + 1;

                        //tflValParam variavel configuravel para o contador de erro de tfl.
                        if (mobile[doc.vid].config.canb.tflCount >= parameter.tflValueError) {
                            mobile[doc.vid].config.canb.tflAnomaly = true;

                        }
                    }
                    else {
                        if (mobile[doc.vid].config.eco.tfl != undefined) {
                            mobile[doc.vid].config.canb.tflCount = 0;
                        }

                        if (mobile[doc.vid].config.canb.tflAnomaly != undefined) {
                            mobile[doc.vid].config.canb.tflAnomaly = false;
                        }
                        mobile[doc.vid].config.eco.tfl = doc.exd.eco.tfl
                    }


                    if (doc.exd.eco.flv == undefined) {
                        mobile[doc.vid].config.canb.flvAnomaly = true;

                    } else if (mobile[doc.vid].config.canb.flvAnomaly != undefined && doc.exd.eco.flv != undefined) {
                        mobile[doc.vid].config.canb.flvAnomaly = false;
                    }


                }
                else if (doc.exd.eco.rpm >= parameter.rpmLimitValue) {
                    console.dir("Entrou no else if das horas de motor|| " + doc.vid);
                    if (mobile[doc.vid].config.tmx - mobile[doc.vid].config.eco.motorHours >= 3600000 && mobile[doc.vid].config.eco.ehr != undefined) {
                        console.dir(doc.vid + " entrou " + doc.tmx + " " + doc.exd.eco.ehr);
                        if (doc.exd.eco.ehr == mobile[doc.vid].config.eco.ehr) {
                            mobile[doc.vid].config.canb.ehrAnomaly = true;
                            console.dir(doc.vid + "||Anomalya EHR");
                        }
                        else {
                            console.dir("actualizou o mobile.ehr com o doc.exd.eco.ehr");
                            mobile[doc.vid].config.eco.ehr = doc.exd.eco.ehr
                        }
                        console.dir("actualizou o mobile.ehr com o doc.tmx");
                        mobile[doc.vid].config.eco.motorHours = doc.tmx;
                    }
                }
                else {
                    //Temos de arranjar maneira de este if so verificar de hora a hora


                    mobile[doc.vid].config.eco.ckm = doc.exd.eco.ckm;
                    mobile[doc.vid].config.eco.tfl = doc.exd.eco.tfl;
                    mobile[doc.vid].config.eco.ehr = doc.exd.eco.ehr;

                    if (mobile[doc.vid].config.canb.ckmAnomaly != undefined) {
                        mobile[doc.vid].config.canb.ckmAnomaly = false;
                    }
                    if (mobile[doc.vid].config.canb.tflAnomaly != undefined) {
                        mobile[doc.vid].config.canb.tflAnomaly = false;
                        mobile[doc.vid].config.canb.tflCount = 0;
                    } else if (mobile[doc.vid].config.canb.flvAnomaly != undefined) {
                        mobile[doc.vid].config.canb.flvAnomaly = false;
                    }

                }
            }
        }
    }
    Logger.info(doc.vid + "||" + doc.tmx + "||" + JSON.stringify(mobile[doc.vid].config))
}