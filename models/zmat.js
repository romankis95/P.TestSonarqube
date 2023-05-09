const mongoose = require("mongoose");

//QUESTO è LO SCHEMA DI ZMAT CHE PRENDO DALLO SCAMBIO DATI SAP ISI
const mat = new mongoose.Schema({
    MATNR: {
        type: String,
        required: true
    },
    MAKTX: {
        type: String,
        required: true
    },
    MTART: String,
    MEINS: String,
});

module.exports = mongoose.model("SAP_MAT", mat);