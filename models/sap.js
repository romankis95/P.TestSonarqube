const mongoose = require("mongoose");

//QUESTO è LO SCHEMA DI ZMAT CHE PRENDO DALLO SCAMBIO DATI SAP ISI
const mat = new mongoose.Schema({
    MANDT: String,
    NUM_PROT: String,
    MATNR: String,
    MAKTX: String,
    LABST: String,
    MEINS: String,
    QTA_ELABORATA: String,
    ICON_URG: String,
    LIV_URGEN: String,
    DESC_LIV_U: String,
    DATUM_I: String,
    UZEIT_I: String,
    UNAME_I: String,
    DATUM_M: String,
    UZEIT_M: String,
    UNAME_M: String,
    STATO: String,
    DESC_STATO: String,
    NOTE: String,
});

module.exports = mongoose.model("SAP_ZLIST_ZPREL", mat);