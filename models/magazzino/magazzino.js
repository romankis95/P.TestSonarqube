const mongoose = require('mongoose');
const moment = require("moment");

var magazzinoSchema = mongoose.Schema({
    nome: {
        type: String,
        unique: true,
        required: true
    },
    data: {
        type: String,
        default: moment().format("YYYYMMDDHHmmss"),
        required: true
    }
});

module.exports = mongoose.model('Magazzino', magazzinoSchema);