
    exports.updateFlagsEco = function(doc,mobile) {
        console.dir("1")
    if (doc.exd.eco) {
        console.dir("2")
        mobile[doc.vid].config.existFlagEco = true;
        mobile[doc.vid].config.ecoflag = 1;
        mobile[doc.vid].config.eco = {}
    }
    else if (!(doc.exd.eco) && mobile[doc.vid].config.existFlagEco == true) {
        console.dir("3")
        mobile[doc.vid].config.ecoflag = 0;

    }

}

exports.updateFlagsTmp = function(doc,mobile) {
    console.dir("4")
    if (doc.exd.tmp) {
        console.dir("5")
        mobile[doc.vid].config.existFlagTmp = true;
        mobile[doc.vid].config.tmpflag = 1;
    }
    if (!(doc.exd.tmp) && mobile[doc.vid].config.existFlagTmp == true) {
        console.dir("6")
        mobile[doc.vid].config.tmpflag = 0;
    }
}

exports.updateFlagsCas = function(doc,mobile) {
    console.dir("7")
if(mobile[doc.vid].config.loc){console.dir("8")
    mobile[doc.vid].config.loc = doc.loc
}else {
    console.dir("9")
    mobile[doc.vid].config.loc = {}
    mobile[doc.vid].config.loc.lat = doc.loc.lat
    mobile[doc.vid].config.loc.lon = doc.loc.lon
}
    //Condição de verificação do CAS (estado do GPS)
    if (doc.cas == 5) {
        console.dir("10")
        mobile[doc.vid].config.casflag =  true;
    } else {
        console.dir("11")
        mobile[doc.vid].config.casflag = false;
    }
}
