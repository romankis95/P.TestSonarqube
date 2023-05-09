const mongoose = require('mongoose');
const moment = require('moment');
const fissiSchema = new mongoose.Schema({

    codice: {
        type: String,
        required: true
    },

    data: {
        type: Number,
        default: moment().format('YYYYMMDDHHmmss')
    },
    magazzino:{
        type: String,
        required: true
        
    }
});


module.exports = mongoose.model('CodiciFissi', fissiSchema);