const mongoose = require('mongoose');


const richiesteSchema = mongoose.Schema({
    codice: String,
    description: String,
    qta: String,
    urgenza: String,
    note: String,
    /**
     * // 
     * 0 da fare
     * 1 in lavorazione
     * 2 fatto
     * 3 cancellato / rifiutato
     * 4 annullato dal operatore
     */
    status: Number,
    magazzino: String, //ALL, manda a tutti i magazzini, ELSE NOME DEL MAGAZZINO
    data: String, // DD/MM/YYYY
    ora: String, // HH:mm:ss
    data_accettazione: String, //è stato fatto un cambio da: DD/MM/YYYY HH:mm:ss  => YYYYMMDD
    data_conclusione: String, //è stato fatto un cambio da: DD/MM/YYYY HH:mm:ss  => YYYYMMDD
    ora_accettazione: String, //HH:mm:ss => aggiunto in data 18/11/2021
    ora_conclusione: String, //HH:mm:ss => aggiunto in data 18/11/2021
    data_eliminazione: String,
    ora_eliminazione: String,
    movimenti: [{
        tipo: String,
        data: String,
        ora: String,
        user: {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            username: String,
        }
    }],
    stock: {
        type: Object,
        default: {}
    },
    richiedente: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
        },
        username: String,
        linea: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
            },
            nomelinea: String,
        },
        keobbettivo: String,
        codicereparto: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
            },
            nomereparto: String,
        }
    },
    rispondente: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
    }
});

module.exports = mongoose.model('Richieste', richiesteSchema);