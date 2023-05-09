const mongoose = require('mongoose');


const movimentiSchema = mongoose.Schema({
    data: String,
    datapart: String,
    codicearticolo: {
        type: String,
        required: true
    },
    movimento: String, //add, remove, update
    ubicazione: {
        type: String,
        required: true
    },
    magazzino: {
        type: String,
        required: true
    },
    quantita: {
        type: Number,
        default: 0
    },
    author: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        nomereale: String,
    }
});

module.exports = mongoose.model('Movimenti', movimentiSchema);