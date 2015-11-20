//variaveis Ficheiro
var fs = require('fs');

//variaveis JS
var tree = require('./arvore.js')

//variaveis Listener
//var Listener = require ('./listener.js')

//variaveis Logs
var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');
var LoggerHistorico = log4js.getLogger('history');

//variaveis MongoDB
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://127.0.0.1:27017/pfc';
var db;
var flags;
var historico;

//variaveis globais
var mobile = {};
var doc;
var objfile;

//Leitura do ficheiro de parametriza��o
var parameters = fs.readFileSync("param.json", "UTF-8");
var parameter = JSON.parse(parameters);

//dbacess = 0 - significa que entrou na base de dados, fazer break no ciclo
//dbacess = 1 - significa que nao precisa de aceder a base de dados, e assim evita max stack exceeded error
var dbacess = 0;


//Ler do ficheiro e enviar para searchFilePile para percorrer a pilha
function init() {
    fs.readFile('log.log', 'utf8', function (err, source) {
        objfile = JSON.parse(source);
        searchFilePile(objfile);
    })
}

//Verificar se a @mobile est� vazio, se estiver, vai � DB buscar os dados caso existem e s� depois inicia a Inser��o/Actualiza��o
//se @mobile n�o estiver vazio, inicia a Inser��o/Actualiza��o
exports.checkDb = function () {
    MongoClient.connect(url, function (err, database) {
        db = database;
        flags = db.collection('flags');
        historico = db.collection('historico');
        if (isEmpty(mobile) == true) {
            dbToMemory(init);
        }
        else {
            init();
        }
    })
}


//Ver a cabe�a da pilha dos documentos do ficheiro/stream recursivamente.
function searchFilePile(arrayfile) {
    while (arrayfile.length >= 0) {
        if (arrayfile.length == 0) {
            noCommunication(mobile);
            console.dir("end")
            return;
        }
        doc = arrayfile[0];
        searchMobilePile(arrayfile[0], cuMobilePile);
        if (dbacess < 1) {
            break;
        }
    }
}

//Comparar o documento do ficheiro com o que est� guardado em mem�ria.
//Se existir em mem�ria, actualiza se tmx mais recente
//se n�o existir em mem�ria, insere
function searchMobilePile(filedocument, callback) {
    if (!(filedocument.tmx instanceof Date)) {
        filedocument.tmx = new Date(filedocument.tmx)
    }

    //Se n�o existir, insere em mem�ria e MongoDB
    if (!mobile[filedocument.vid]) {
        dbacess = 0;
        mobile[filedocument.vid] = {vid: filedocument.vid, config: {tmx: filedocument.tmx}};
        mobile[filedocument.vid].config.countLogs = 1;
        callback(arvore(filedocument, mobile), insertMongo);
        insertHistory(filedocument)
    }
//se existir e for mais recente, actualiza em memoria e MongoDB
    else if (mobile[filedocument.vid].config.tmx <= filedocument.tmx) {
        mobile[doc.vid].config.countLogs += 1;
        dbacess = 0;
        mobile[filedocument.vid].config.tmx = filedocument.tmx;
        callback(arvore(filedocument, mobile), updateMongo);
        insertHistory(filedocument)
    }
    //se existir,e for mais antigo, passa para o proximo documento da pilha
    else {
        objfile.shift();
        dbacess = 1;
    }

}

//Metodo de decisao entre Insert e Update
function cuMobilePile(document, callback) {
    callback(document);

}
//Insert na BD
function insertMongo(document) {
    flags.insert(document, {safe: true}, function (err, result) {
        if (err) {
            throw err;
        }
        Logger.info("Insert| " + JSON.stringify(document.vid) + " " + JSON.stringify(document.config.tmx));
        objfile.shift();
        searchFilePile(objfile);
    })
}

//Update na BD
function updateMongo(document) {
    flags.update({vid: document.vid}, document, {upsert: true}, function (err, result) {
        if (err){
            throw err;
        }
        Logger.info("Update| " + JSON.stringify(document.vid) + " " + JSON.stringify(document.config.tmx));
        objfile.shift();
        searchFilePile(objfile);
    })
}

//se n�o existir documentos em mem�ria, carregar da BD, caso exista, os documentos guardados
function dbToMemory(callback) {
    flags.find({}, function (err, cursor) {
        function handleItem(err, item) {
            if (item == null) {
                return callback();
            }
            if (mobile[item.vid] != item) {
                mobile[item.vid] = item;
            }
            cursor.nextObject(handleItem);
        }

        cursor.nextObject(handleItem);
    })
}

//verificar se a mem�ria est� vazia
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

//call da arvore
function arvore(filedocument, mobile) {
    tree.ramoGPS(filedocument, mobile);
    tree.ramoCas(filedocument, mobile);
    tree.ramoEco(filedocument, mobile);
    tree.ramoCANB(filedocument, mobile);
    tree.ramoTmp(filedocument, mobile);

    return mobile[filedocument.vid];
}

//Procura por anomalias e Insere no historico
function insertHistory(doc) {
    var aux = {}
    var auxhis = 0;
    aux.vid = mobile[doc.vid].vid
    aux.tmx = mobile[doc.vid].config.tmx
    aux.anomalia = "";
    aux.comments = [];
    aux.color = 0;

    if (mobile[doc.vid].config.tmp != undefined) {
        for (var prop in mobile[doc.vid].config.tmp) {
            if (mobile[doc.vid].config.tmp.hasOwnProperty(prop)) {
                if (mobile[doc.vid].config.tmp.prop) {
                    if (mobile[doc.vid].config.tmp.prop.TmpAnomaly == 1) {
                        aux.anomalia += " ERRO TEMP: FALHA DE COMUNICACAO";
                        mobile[doc.vid].config.tmp.prop.ArrayEventoTmp = [];
                        mobile[doc.vid].config.tmp.prop.contadorEventoTmp = 0;
                        mobile[doc.vid].config.tmp.prop.contadorTemp = [];
                        mobile[doc.vid].config.tmp.prop.contador = 0;
                        mobile[doc.vid].config.tmp.prop.TmpAnomaly = 0;
                        mobile[doc.vid].config.tmp.prop.counterTmp = mobile[doc.vid].config.countLogs;
                        aux.Anom = 1;
                        aux.color += 1
                    }
                    if (mobile[doc.vid].config.tmp.prop.TmpFlappingAnomaly == 1) {
                        aux.anomalia += " ERRO TEMP : FLAPPING "
                        mobile[doc.vid].config.tmp.prop.ArrayEventoTmp = [];
                        mobile[doc.vid].config.tmp.prop.contadorEventoTmp = 0;
                        mobile[doc.vid].config.tmp.prop.contadorTemp = [];
                        mobile[doc.vid].config.tmp.prop.contador = 0;
                        mobile[doc.vid].config.tmp.prop.TmpFlappingAnomaly = 0;
                        mobile[doc.vid].config.tmp.prop.counterTmp = mobile[doc.vid].config.countLogs;
                        aux.Anom = 1;
                        aux.color += 1
                    }
                    if (mobile[doc.vid].config.tmp.prop.tmp && ([127.9, 85, 200, -273.5, -500, -100].indexOf(mobile[doc.vid].config.tmp.prop.tmp) > -1)) {
                        aux.anomalia += "ERRO " + prop + ": TEMPERATURE ERROR";
                        aux.Anom = 1;
                        aux.color += 5
                        auxhis += 1;
                    }
                }
            }
        }
    }

    if (aux.anomalia.cas == undefined) {
        aux.anomalia.cas = "";
    }

    if (mobile[doc.vid].config.gps != undefined) {
        if (mobile[doc.vid].config.gps.gpsAnomali) {
            aux.anomalia += " ERRO GPS : POSICAO FIXA ou 0.0 || "
            aux.Anom = 1;
            aux.color += 1
        }
    }
    if (mobile[doc.vid].config.cas != undefined) {
        if (mobile[doc.vid].config.cas.Parkedcas5Anomaly == 1) {
            aux.anomalia += " ERRO CAS: CAS 5 FIXO - Veiculo Parado";
            mobile[doc.vid].config.cas.Parkedcas5Anomaly = 0;
            mobile[doc.vid].config.cas.ArrayEventoParked5 = [];
            mobile[doc.vid].config.cas.contadorEventoParked5 = 0;
            mobile[doc.vid].config.cas.arrayParked5.length = 0;
            mobile[doc.vid].config.cas.contadorParked5 = 0;
            mobile[doc.vid].config.cas.contadorCas5Logs = mobile[doc.vid].config.countLogs;
            aux.Anom = 1;
            aux.color += 1;
            auxhis = 1;
        }
        if (mobile[doc.vid].config.cas.Parkedcas5FlappingAnomaly == 1) {
            aux.anomalia += " ERRO CAS: CAS 5 FLAPPING - Veiculo Parado";
            mobile[doc.vid].config.cas.Parkedcas5FlappingAnomaly = 0;
            mobile[doc.vid].config.cas.ArrayEventoParked5 = [];
            mobile[doc.vid].config.cas.contadorEventoParked5 = 0;
            mobile[doc.vid].config.cas.arrayParked5.length = 0;
            mobile[doc.vid].config.cas.contadorParked5 = 0;
            mobile[doc.vid].config.cas.contadorCas5Logs = mobile[doc.vid].config.countLogs;
            aux.Anom = 1;
            aux.color += 1;
            auxhis = 1;
        }

        if (mobile[doc.vid].config.cas.Movcas5Anomaly == 1) {
            aux.anomalia += " ERRO CAS: CAS 5 FIXO - Veiculo Movimento";
            mobile[doc.vid].config.cas.Movcas5Anomaly = 0;
            mobile[doc.vid].config.cas.ArrayEventoMov5 = [];
            mobile[doc.vid].config.cas.contadorEventoMov5 = 0;
            mobile[doc.vid].config.cas.arrayMov5.length = 0;
            mobile[doc.vid].config.cas.contadorMov5 = 0;
            mobile[doc.vid].config.cas.contadorCas5Logs = mobile[doc.vid].config.countLogs;
            aux.Anom = 1;
            aux.color += 1;
            auxhis = 1;
        }
        if (mobile[doc.vid].config.cas.Movcas5FlappingAnomaly == 1) {
            aux.anomalia += " ERRO CAS: CAS 5 FLAPPING - Veiculo Movimento";
            mobile[doc.vid].config.cas.Movcas5FlappingAnomaly = 0;
            mobile[doc.vid].config.cas.ArrayEventoMov5 = [];
            mobile[doc.vid].config.cas.contadorEventoMov5 = 0;
            mobile[doc.vid].config.cas.arrayMov5.length = 0;
            mobile[doc.vid].config.cas.contadorMov5 = 0;
            mobile[doc.vid].config.cas.contadorCas5Logs = mobile[doc.vid].config.countLogs;
            aux.Anom = 1;
            aux.color += 1;
            auxhis = 1;
        }

        if (mobile[doc.vid].config.cas.countIntermitente11 == parameter.countCas11Intermit) {
            aux.anomalia += " Erro CAS : CAS 11 FLAPPING"
            if (mobile[doc.vid].config.cas.countFlapping11 == parameter.Cas11Flapping) {
                aux.anomalia.casFlapping = 1;
                mobile[doc.vid].config.cas.tmxcas11Intermitente = []
                mobile[doc.vid].config.cas.cas11Evento = []
                mobile[doc.vid].config.cas.countFlapping11 = 0
                mobile[doc.vid].config.cas.countIntermitente11 = 0
                aux.Anom = 1;
            }

            mobile[doc.vid].config.cas.countIntermitente11 = 0
            aux.color += 1
            auxhis = 1;
        }
    }

    if (mobile[doc.vid].config.casflag == 13 || mobile[doc.vid].config.casflag == 13) {
        aux.anomalia += " ERRO CAS: CAS 13/14 FIXO"
        aux.color += 5
        aux.Anom = 1;
        auxhis = 1;
    }


    if (mobile[doc.vid].config.canb.canbAnomaly == true) {
        aux.anomalia += " ERRO CanBus : Devia existir"
        aux.color += 5;
        aux.Anom = 1;
        auxhis = 1;
    }

    if (mobile[doc.vid].config.canb.ehrAnomaly == true) {
        aux.anomalia += " ERRO CanBus : Erro Horas de Motor "
        aux.color += 5;
        aux.Anom = 1;
        auxhis = 1;
    }

    if (mobile[doc.vid].config.canb.ckmAnomaly == true) {
        aux.anomalia += " ERRO CanBus : Erro CKM "
        aux.color += 5;
        aux.Anom = 1;
        auxhis = 1;
    }

    if (mobile[doc.vid].config.canb.flvAnomaly == true) {
        aux.anomalia += " ERRO CanBus : Erro FLV "
        aux.color += 5;
        aux.Anom = 1;
        auxhis = 1;
    }

    //Definicao de color para nivel de alerta
    if (aux.color > 0 && aux.color < 3) {
        aux.color = "Yellow";
    }
    if (aux.color > 2 && aux.color < 5) {
        aux.color = "Orange"
    }
    if (aux.color > 4) {
        aux.color = "Red"
    }


    if (auxhis == 1 || aux.Anom == 1) {
        insertHistoryMongoFunction(aux)
        return;
    }
    return;
}

//Funcao insert para a coleccao @Historico
function insertHistoryMongoFunction(doc) {
    historico.insert(doc, {safe: true}, function (err, result) {
        if (err) throw err;
        LoggerHistorico.info("History| " + JSON.stringify(doc));
    })
}

function noCommunication(mobile) {
    var systemdate = new Date();
    var keys = Object.keys(mobile);
    for (i in keys) {
        if (systemdate.getTime() - mobile[keys[i]].config.tmx.getTime() > 8900000000) {
            var aux = {};
            aux.vid = mobile[keys[i]].vid;
            aux.tmx = mobile[keys[i]].config.tmx;
            aux.anomalia = "";
            aux.color = 0;
            aux.anomalia = " ERRO Comunicacao :Falha communicacao ";
            aux.color = "Vermelho";
            aux.Anom = 1;
            insertHistoryMongoFunction(aux);
            return;
        }
    }
    return;
}

