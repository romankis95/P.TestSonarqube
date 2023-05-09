const mongoose = require('mongoose');
const moment = require('moment');
const mailSchema = new mongoose.Schema({
    destinatario: {
        type: String,
        required: true
    },
    data: {
        type:String,
        default: moment().format('YYYYMMDDHHmmss')
    },
    type: {
        type: String,
        required: true,
        enum: ['acquisti', 'cq']
    },
});


module.exports = mongoose.model('Mails', mailSchema);