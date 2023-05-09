const mongoose = require('mongoose');


const mardSchema = mongoose.Schema({
    MATNR: String,
    LGORT: String,
    LABST: String,
    INSME: String, 
});

module.exports = mongoose.model('Mard', mardSchema);