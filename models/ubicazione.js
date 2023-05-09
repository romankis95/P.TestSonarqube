const mongoose = require('mongoose');

const ubicazioneSchema = mongoose.Schema({
    /**
     * 
     * 
     */
    armadio: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 1
    },
    ripiano: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 1
    },
    posizione: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 3
    },
    articolo: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 20
    },
    quantita: {
        type: Number,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 6,
        default: 0,
        min: 0,
        max: 999999
    },
    magazzino: String,
    datapart: String,
    datainserimento: String,
    dataultimaqta: String,
    autoreultimaqta: String,

    descrizione: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50
    },
    ubicazione: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 5
    },
    tipo: {
        type: String,
        enum: ['nuovo', 'ritorno'],
        default: 'nuovo'
    },
    um: {
        type: String,
        default: 'PZ',
        enum: [
            'PZ',
            'G',
            'KG',
            'M',
            'MM',
            'NR',
        ]
    },
    ubicatore: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        username: String,
    },
});

module.exports = mongoose.model('Ubicazioni', ubicazioneSchema);