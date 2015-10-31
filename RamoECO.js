var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');
//parameterizacao
var fs = require('fs');
var parameters = fs.readFileSync("param.json", "UTF-8");
var parameter = JSON.parse(parameters);


/**
 *
 * @param doc
 * @param mobile
 */
function verifyIGN(doc, mobile) {
    if (mobile[doc.vid].config == undefined) {
        mobile[doc.vid].config = {}
    }

    //Verifica a posicao da ignicao (ON/OFF)
    if ((doc.exd.io != undefined)) {
        if (doc.exd.io['1'] == 1.0) {
            if (mobile[doc.vid].config.ignON == undefined || mobile[doc.vid].config.ignONFirst == 1) {
                mobile[doc.vid].config.eco.motorHours = doc.tmx;
            }
            mobile[doc.vid].config.ignON = true;
            mobile[doc.vid].config.ignONFirst = 0;
        } else {
            if (mobile[doc.vid].config.ignON == undefined) {
                mobile[doc.vid].config.ignONFirst = 1;
            }
            mobile[doc.vid].config.ignON = false;
        }
    }
    else if (doc.exd.io == undefined && mobile[doc.vid].config.ignON == undefined) {

        if (doc.cas == 60) {
            if (mobile[doc.vid].config.ignON == undefined || mobile[doc.vid].config.ignONFirst == 1) {
                mobile[doc.vid].config.eco.motorHours = doc.tmx;
            }
            mobile[doc.vid].config.ignON = true;
            mobile[doc.vid].config.ignONFirst = 0;

        }
        else if (doc.cas == 61) {
            if (mobile[doc.vid].config.ignON == undefined) {
                mobile[doc.vid].config.ignONFirst = 1;
            }
            mobile[doc.vid].config.ignON = false;

        }
    } else if (doc.exd.io == undefined && mobile[doc.vid].config.ignON != undefined) {
        if (doc.cas == 60) {
            if (mobile[doc.vid].config.ignON == undefined || mobile[doc.vid].config.ignONFirst == 1) {
                mobile[doc.vid].config.eco.motorHours = doc.tmx;
            }
            mobile[doc.vid].config.ignON = true;
            mobile[doc.vid].config.ignONFirst = 0;
        }
        else if (doc.cas == 61) {
            if (mobile[doc.vid].config.ignON == undefined) {
                mobile[doc.vid].config.ignONFirst = 1;
            }
            mobile[doc.vid].config.ignON = false;

        }
    }
}

//Esta funcao esta responsavel por verificar se as viaturas tem modulo Ecodrive e se tem CanBus.
//@Param doc - Os dados que sao lidos directamente do streaming
//@Param mobile - variavel de memoria que guarda todos os dados necessario de cada viatura, sendo o vid unico.
//				  Esta variavel e a que vai ser guardada numa coleccao mongo (flags)


    exports.ramoEco = function (doc, mobile) {
        if (mobile[doc.vid].config.eco == undefined) {
            mobile[doc.vid].config.eco = {}
        }
        verifyIGN(doc, mobile)
        if (mobile[doc.vid].config.ignON != undefined && mobile[doc.vid].config.ignON) {
            /**
             Verifica se a viatura tem modulo Eco.
             Verificar se a viatura tem Eco e (cas 3 ou cas 220):
             Sim - Alteramos o valor da flag existFlagEco = true e a ecoflag = 1 (garantimos assim que a viatura tem modulo Eco e esta activo)
             Nao - Vamos verificar se a viatura nao tem Eco mas tem a flag existFlagEco = true (ja teve eco nos logs anteriores):
             Sim - alteramos o valor da ecoflag = 0 (para indicar que a viatura naquele TMX nao tem Eco mas devia ter)
             Nao - Nao faz nada e sai
             */
            if (doc.exd.eco instanceof Object && (doc.cas == 3 || doc.cas == 220)) {
                mobile[doc.vid].config.existFlagEco = true;
                mobile[doc.vid].config.ecoflag = 1;
                /**
                 Verifica se a viatura tem CANBus.
                 Vamos ver se a viatura tem rpm ou ckm:
                 Sim - altera a flag canbflag = 1, e atribui-se o valor dos rpm a variavel de memoria (mobile)
                 Nao - verifica-se caso a viatura ja tenha canbflag =1:
                 Sim - altera-se o valor dos RPM e CKM da variavel mobile para -1, para indicar que a viatura tem CANBus mas nao foram lidos os dados (possivel anomalia no CANBus)
                 Nao - Nao faz nada e sai.
                 */
                if ((doc.exd.eco.rpm !== undefined || doc.exd.eco.ckm !== undefined) && (doc.cas == 3 || doc.cas == 220)) {
                    mobile[doc.vid].config.eco.rpm = doc.exd.eco.rpm;
                    mobile[doc.vid].config.existCanb = true
                    mobile[doc.vid].config.canbflag = 1
                }

            }
            //Nao Existe ECO mas devia Existir.
            //valor -2 significa que nao existe leitura daquele campo no tmx actual daquela viatura, mas ja existiu em tmx's anteriores.
            else if ((!(doc.exd.eco instanceof Object) && mobile[doc.vid].config.existFlagEco == true) && (doc.cas == 3 || doc.cas == 220)) {
                mobile[doc.vid].config.ecoflag = 0;
                mobile[doc.vid].config.canbflag = 0
                if (mobile[doc.vid].config.existCanb !== undefined && mobile[doc.vid].config.canbflag == 0) {
                    mobile[doc.vid].config.eco.rpm = -2;
                    mobile[doc.vid].config.eco.ckm = -2;
                    mobile[doc.vid].config.canb.canbAnomaly = true;
                }

            }

            //Vai verificar se a viatura tem gkm (com cas = 3 ou cas = 220):
            //Sim - atribui o valor dos gkm ao campo gkm da variavel mobile
            //Nao - atribui o valor -1 ao campo gkm da variavel mobile para indicar que nao existe leitura de gkm.
            if (doc.gkm !== undefined && ((doc.cas == 3 || doc.cas == 220))) {
                mobile[doc.vid].config.gkm = doc.gkm
            } else {
                mobile[doc.vid].config.gkm = -1;
            }
        }


    }