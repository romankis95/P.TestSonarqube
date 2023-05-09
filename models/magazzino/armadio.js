const mongoose = require('mongoose');
const moment = require("moment");


const armadioSchema = mongoose.Schema({
    armadio: {
        type: String,
        required: true,
        maxLength: 20
    },
    ripiano: {
        type: String,
        required: true,
        maxLength: 1
    },
    data: {
        type: String,
        default: moment().format("YYYYMMDDHHmmss"),
        required: true
    },
    magazzino: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        magazzino: String,
    },
});

module.exports = mongoose.model('Armadio', armadioSchema);