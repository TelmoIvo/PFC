var log4js = require('log4js');
log4js.configure("./Configs/log4js.js");
var Logger = log4js.getLogger('configAuto');
//parameterizacao
var fs = require('fs');
var parameters = fs.readFileSync("param.json", "UTF-8");
var parameter = JSON.parse(parameters);

//Avaliar o campo CAS dos registos
exports.ramoCas = function (doc, mobile) {
    //caso nao exista campo cas e memoria (acontece quando é um novo veiculo), cria-se um nested document com os valores iniciais das variaveis
    if (mobile[doc.vid].config.cas == undefined) {
        mobile[doc.vid].config.cas = {}
        mobile[doc.vid].config.cas.countBlock5 = 0;
        mobile[doc.vid].config.cas.countFlapping5 = 0;
        mobile[doc.vid].config.cas.countIntermitente11 = 0;
        mobile[doc.vid].config.cas.countFlapping11 = 0;
        mobile[doc.vid].config.cas.tmxcas11Intermitente = []
        mobile[doc.vid].config.cas.cas11Evento = []


    }
    //Condi??o de verifica??o do CAS =5 (posicao GPS n?o actualizada)
    if (doc.cas == 5 ) {
        causa5(doc, mobile)
    }

       //Condi??o de verifica??o de restart do equipamento (cas 11)
    if (doc.cas == 11) {
        causa11(doc, mobile);
    }
    //reset ao contador de causa 11 fixa
    if (doc.cas != 11) {
        mobile[doc.vid].config.cas.countBlock11 = 0;
    }
    //Condi??o de verifica??o o corte e o curto circuito de GPS (cas 13 e 14)
    else if ((doc.cas == 13 || doc.cas == 14) && mobile[doc.vid].config.ignON == true) {
        mobile[doc.vid].config.casflag = doc.cas
    }

    //guardar o valor da variavel CAS
    mobile[doc.vid].config.casflag = doc.cas
}

/*
 @return - mobile[doc.vid].config.cas.countIntermitente5 e mobile[doc.vid].config.cas.countFlappingt5,
 valores do numero de casos 5 num espaço de tempo configuravel(Cas11EventoDifference) que lança um evento de intermitencia
 valor do numero de casos de evento de intermitencia num espaço de tempo configuravel (Cas11FlappingDifference) que lança uma anomalia de flapping
 */



function causa5(doc, mobile) {
   if(mobile[doc.vid].config.cas.contadorMov5 == undefined){
       mobile[doc.vid].config.cas.contadorMov5 = 0;
       mobile[doc.vid].config.cas.arrayMov5 = []
   }
    if(mobile[doc.vid].config.cas.contadorParked5 == undefined){
        mobile[doc.vid].config.cas.contadorParked5 = 0;
        mobile[doc.vid].config.cas.arrayParked5 = []
    }
    if(mobile[doc.vid].config.ignON ==true){
        if(mobile[doc.vid].config.cas.gsp > 15){

            mobile[doc.vid].config.cas.arrayMov5[mobile[doc.vid].config.cas.contadorMov5] = doc.tmx;
            mobile[doc.vid].config.cas.contadorMov5 += 1;
        }
        else{
            mobile[doc.vid].config.cas.arrayParked5[mobile[doc.vid].config.cas.contadorParked5] = doc.tmx;
            mobile[doc.vid].config.cas.contadorParked5 += 1;
        }
    }
    else if(mobile[doc.vid].config.ignON == false){
        mobile[doc.vid].config.cas.arrayParked5[mobile[doc.vid].config.cas.contadorParked5] = doc.tmx;
        mobile[doc.vid].config.cas.contadorParked5 += 1;
    }
    if(doc.tmx - mobile[doc.vid].config.cas.arrayParked5[0] > parameter.DeltaTimeCas5){
        if(mobile[doc.vid].config.cas.contadorEventoParked5 == undefined){
            mobile[doc.vid].config.cas.contadorEventoParked5 = 0;
        }

        if(mobile[doc.vid].config.cas.contadorParked5 / mobile[doc.vid].config.countLogs >=parameter.Cas5Ratio){
            if(!mobile[doc.vid].config.cas.ArrayEventoParked5){
                mobile[doc.vid].config.cas.ArrayEventoParked5 = []
            }
            mobile[doc.vid].config.cas.ArrayEventoParked5[mobile[doc.vid].config.cas.contadorEventoParked5] = doc.tmx;
            var auxeventotmx = (mobile[doc.vid].config.cas.ArrayEventoParked5[mobile[doc.vid].config.cas.contadorEventoParked5].getTime()
            - mobile[doc.vid].config.cas.ArrayEventoParked5[0].getTime());
            mobile[doc.vid].config.cas.contadorEventoParked5 +=1;
            if(auxeventotmx > 0 && auxeventotmx <= parameter.DeltaTimeCas5 ){
                        mobile[doc.vid].config.cas.Parkedcas5Anomaly = 1;
            }
            else if(auxeventotmx >parameter.DeltaTimeCas5 && auxeventotmx <=parameter.DeltaTimeCas5Flapping){
                mobile[doc.vid].config.cas.Parkedcas5FlappingAnomaly = 1;
            }
            else{
                mobile[doc.vid].config.cas.ArrayEventoParked5.length = 0
                mobile[doc.vid].config.cas.contadorEventoParked5 = 0;
                mobile[doc.vid].config.cas.ArrayEventoParked5[mobile[doc.vid].config.cas.contadorEventoParked5] = doc.tmx;
                mobile[doc.vid].config.cas.contadorEventoParked5 += 1
            }
        } else{
            mobile[doc.vid].config.cas.ArrayEventoParked5.length = 0
            mobile[doc.vid].config.cas.contadorEventoParked5 = 0;
            mobile[doc.vid].config.cas.ArrayEventoParked5[mobile[doc.vid].config.cas.contadorEventoParked5] = doc.tmx;
            mobile[doc.vid].config.cas.contadorEventoParked5 += 1
        }
    }

    if(doc.tmx - mobile[doc.vid].config.cas.arrayMov5[0] > parameter.DeltaTimeCas5){
        if(mobile[doc.vid].config.cas.contadorEventoMov5 == undefined){
            mobile[doc.vid].config.cas.contadorEventoMov5 = 0;
        }

        if(mobile[doc.vid].config.cas.contadorMov5 / mobile[doc.vid].config.countLogs >=parameter.Cas5Ratio){
           mobile[doc.vid].config.cas.ArrayEventoMov5[mobile[doc.vid].config.cas.contadorEventoMov5] = doc.tmx;
            var auxeventotmx = (mobile[doc.vid].config.cas.ArrayEventoMov5[mobile[doc.vid].config.cas.contadorEventoMov5].getTime()
            - mobile[doc.vid].config.cas.ArrayEventoMov5[0].getTime());
            mobile[doc.vid].config.cas.contadorEventoMov5 +=1;
            if(auxeventotmx > 0 && auxeventotmx <= parameter.DeltaTimeCas5 ){
                mobile[doc.vid].config.cas.Movcas5Anomaly = 1;
            }
            else if(auxeventotmx >parameter.DeltaTimeCas5 && auxeventotmx <=parameter.DeltaTimeCas5Flapping){
                mobile[doc.vid].config.cas.Movcas5FlappingAnomaly = 1;
            }
            else{
                mobile[doc.vid].config.cas.ArrayEventoMov5.length = 0
                mobile[doc.vid].config.cas.contadorEventoMov5 = 0;
                mobile[doc.vid].config.cas.ArrayEventoMov5[mobile[doc.vid].config.cas.contadorEventoMov5] = doc.tmx;
                mobile[doc.vid].config.cas.contadorEventoMov5 += 1
            }
        } else{
            mobile[doc.vid].config.cas.ArrayEventoMov5.length = 0
            mobile[doc.vid].config.cas.contadorEventoMov5 = 0;
            mobile[doc.vid].config.cas.ArrayEventoMov5[mobile[doc.vid].config.cas.contadorEventoMov5] = doc.tmx;
            mobile[doc.vid].config.cas.contadorEventoMov5 += 1
        }
    }
}

/*
 @return - mobile[doc.vid].config.cas.countIntermitente5 e mobile[doc.vid].config.cas.countFlappingt5,
 valores do numero de casos 11 num espaço de tempo configuravel(Cas11EventoDifference) que lança um evento de intermitencia
 valor do numero de casos de evento de intermitencia num espaço de tempo configuravel (Cas11FlappingDifference) que lança uma anomalia de flapping
 */
function causa11(doc, mobile) {
    mobile[doc.vid].config.cas.countBlock11 += 1;
    //se o contador de casos para lançamento de eventos for igual a 0 ||
    // o resto entre o numero de casos para lançamentos de eventos e o parametro de quantos casos de intermitencia são necessarios para o lançar o evento
    // for diferente de 0
    if (mobile[doc.vid].config.cas.countIntermitente11 == 0 || mobile[doc.vid].config.cas.countIntermitente11 % parameter.countCas11Intermit != 0) {
        //se o contador de casos for 0
        if (mobile[doc.vid].config.cas.countIntermitente11 == 0) {
            // o array de casos guarda o tmx do documento actual na posicao 0 do array que é usado para comparação de datas
            mobile[doc.vid].config.cas.tmxcas11Intermitente[0] = mobile[doc.vid].config.tmx
            //e incrementa o contador
            mobile[doc.vid].config.cas.countIntermitente11 += 1
        }
        //se o contador for maior que 0
        if (mobile[doc.vid].config.cas.countIntermitente11 > 0) {
            //compara a data do documento actual com a data que está na posição do array de comparação de datas a diferença for menor que
            //a diferença estipulada no ficheiro de parametros, entra na condição se for menor ou igual
            if (mobile[doc.vid].config.tmx - mobile[doc.vid].config.cas.tmxcas11Intermitente[0] <= parameter.Cas11EventoDifference) {
                //guarda o tmx do documento actual na posiçao do array com o index = ao valor do contador de intermitencia
                mobile[doc.vid].config.cas.tmxcas11Intermitente[mobile[doc.vid].config.cas.countIntermitente11] = mobile[doc.vid].config.tmx;
                //incrementa o contador
                mobile[doc.vid].config.cas.countIntermitente11 += 1
            }
            //se a diferenca for maior
            else {
                //retira a cabeça do array
                mobile[doc.vid].config.cas.tmxcas11Intermitente.shift()
                // e o contador é igual ao tamanho do array
                mobile[doc.vid].config.cas.countIntermitente11 = mobile[doc.vid].config.cas.tmxcas11Intermitente.length;
            }
        }
    }
    //se o contador tiver valor diferente de 0
    // o resto entre o numero de casos para lançamentos de eventos e o parametro de quantos casos de intermitencia são necessarios para o lançar o evento
    // for igual 0
    if (mobile[doc.vid].config.cas.countIntermitente11 != 0 && mobile[doc.vid].config.cas.countIntermitente11 % parameter.countCas11Intermit == 0) {
        //se a data actual menos o valor do array na posicao 0 for menor ou igual ao parametro de tempo para lançar o evento
        if ((mobile[doc.vid].config.tmx).getTime() - mobile[doc.vid].config.cas.tmxcas11Intermitente[0].getTime() <= parameter.Cas11EventoDifference) {
            //se o contador de flapping for maior que 0
            if (mobile[doc.vid].config.cas.countFlapping11 > 0) {
                //se a diferenca entre tmx actual com o tmx do evento na posição 0 do array de eventos for menor que o parametro de tempo para flapping
                if ((mobile[doc.vid].config.tmx).getTime() - (mobile[doc.vid].config.cas.cas11Evento[0]).getTime() <= parameter.Cas11FlappingDifference) {
                    //guarda o tmx do evento na posiçao com o index igual ao valor do contador de flapping
                    mobile[doc.vid].config.cas.cas11Evento[mobile[doc.vid].config.cas.countFlapping11] = mobile[doc.vid].config.tmx;
                    //incrementa o contador de flapping
                    mobile[doc.vid].config.cas.countFlapping11 += 1;
                }
                //se a diferenca entre a data do evento actual com o tmx do evento na posicao 0 do array for maior que o parametro de tempo para flapping
                if ((mobile[doc.vid].config.tmx).getTime() - (mobile[doc.vid].config.cas.cas11Evento[0]).getTime() > parameter.Cas11FlappingDifference) {
                    mobile[doc.vid].config.cas.cas11Evento.shift()
                    mobile[doc.vid].config.cas.countFlapping11 = mobile[doc.vid].config.cas.cas11Evento.length;
                }
            }
            //se for igual a 0
            if (mobile[doc.vid].config.cas.countFlapping11 == 0) {
                //guarda o evento na posicao 0
                mobile[doc.vid].config.cas.cas11Evento[mobile[doc.vid].config.cas.countFlapping11] = mobile[doc.vid].config.tmx;
                //e incrementa o contador de flapping
                mobile[doc.vid].config.cas.countFlapping11 += 1;
            }
        }
        //se o valor do contador de tempo for maior que o tempo limite de evento
        if (mobile[doc.vid].config.cas.cas11countIntermitente > parameter.Cas11EventoDifference) {
            mobile[doc.vid].config.cas.tmxcas11Intermitente.shift()
            mobile[doc.vid].config.cas.countIntermitente11 = mobile[doc.vid].config.cas.tmxcas11Intermitente.length;
        }
    }
}
