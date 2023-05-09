const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const utenti_schema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    linea: {

        nomelinea: String,
    },
    codicereparto: {
        nomereparto: String,
    },
    nomereale: String,
    magazzino: {
        type: String,
        enum: ['MOTORI','TEST', 'BRACCI', 'STOCKAGGIO', 'TRANCERIA', 'PIASTRE', ],
    },
    password: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    isMagazziniere: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true //true active, false deactive
    },


});

utenti_schema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", utenti_schema);