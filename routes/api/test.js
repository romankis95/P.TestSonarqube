/**librerie */
const express = require("express");
const router = express.Router();


const moment = require("moment");
const RICHIESTE = require("../../models/richieste");
const USER = require("../../models/user");
const UBICAZIONE = require("../../models/ubicazione");
const MOVIMENTI = require("../../models/movimenti");

/**Database */

/**extensions+middleware */
const logger = require("../extensions/logger");


module.exports = router;




router.post("/deletesingleubicazione", async function (req, res) {
    var id = req.query.id || null;
    var utente = req.query.utente || null;
    var ubicazione = req.query.ubicazione || null;

    if (id && utente && ubicazione) {
        if (id != "" && utente != "" && ubicazione != "") {

            var richiesta = await RICHIESTE.findById(id).lean();
            if (richiesta) {
                var codice = richiesta.codice;

                codice = codice.trim();
                codice = codice.toUpperCase();
                utente = utente.trim();
                utente = utente.toUpperCase();
                ubicazione = ubicazione.trim();
                ubicazione = ubicazione.toUpperCase();
                try {
                    var user = await USER.findOne({
                        "username": utente.toString()
                    }).lean();

                    if (user) {
                        var query = {
                            magazzino: user.magazzino.toString(),
                            articolo: codice.toString(),
                            ubicazione: ubicazione.toString()
                        };
                        var result = await UBICAZIONE.findOne(query).lean();

                        if (result) {
                            var cancellato = await UBICAZIONE.findByIdAndDelete(result._id);

                            var movimento = {
                                data: moment().format("DD/MM/YYYY HH:mm:ss"),
                                datapart: moment().format("YYYYMMDD"),
                                codicearticolo: result.articolo,
                                movimento: "remove",
                                ubicazione: result.armadio + "" + result.ripiano + "" + result.posizione,
                                author: user,
                                magazzino: result.magazzino
                            };
                            var z = await MOVIMENTI.create(movimento);
                            var updatato = await RICHIESTE.findByIdAndUpdate(richiesta._id, {
                                $push: {
                                    movimenti: {
                                        tipo: "svotato " + ubicazione,
                                        data: moment().format("YYYYMMDD"),
                                        ora: moment().format("HH:mm:ss"),
                                        user: user
                                    }
                                }
                            });
                            return res.json({
                                type: "success",
                                message: "Tutto ok",
                                data: null
                            });
                        } else {

                            return res.json({
                                type: "warning",
                                message: "Nulla da fare qui, non trovo l\'ubicazione sul server!",
                                data: null
                            });
                        }
                    } else {
                        return res.json({
                            type: "error",
                            message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
                            data: null
                        });
                    };

                } catch (error) {
                    logger.error(error);
                    return res.json({
                        type: "error",
                        message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
                        data: null
                    });
                }

            } else {
                return res.json({
                    type: "warning",
                    message: "Non riesco a recuperare la richiesta dal server",
                    data: null
                });
            }
        } else {
            return res.json({
                type: "warning",
                message: "Nulla da fare qui, non sei ne di STOCKAGGIO, ne di MOTORI",
                data: null
            });
        };
    } else {
        return res.json({
            type: "warning",
            message: "Nulla da fare qui, non sei ne di STOCKAGGIO, ne di MOTORI",
            data: null
        });
    };
});


router.get("/singolarichiesta", async function (req, res) {
    var id = req.query.id || null;
    if (id) {
        id = id.trim();
        var trovato = await RICHIESTE.findById(id).lean();
        if (trovato) {
            return res.json({
                type: "success",
                message: "Ok",
                data: trovato
            });
        } else {
            return res.json({
                type: "warning",
                message: "Nessuna richiesta passata",
                data: null
            });
        }

    } else {
        return res.json({
            type: "warning",
            message: "Nessun id passato",
            data: null
        });
    };
});


async function fixStorico() {
    var allRichieste = await RICHIESTE.find().lean();
    for (let i = 0; i < allRichieste.length; i++) {
        if (allRichieste[i].status == 1) {
            var accettazione = allRichieste[i].data_accettazione;
            var dataacc = moment(accettazione, "DD/MM/YYYY HH:mm:ss").format("YYYYMMDD");
            var oraacc = moment(accettazione, "DD/MM/YYYY HH:mm:ss").format("HH:mm:ss");
            allRichieste[i].data_accettazione = allRichieste[i].data;
            allRichieste[i].ora_accettazione = oraacc;
        }
        if (allRichieste[i].status == 2) {

            var accettazione = allRichieste[i].data_accettazione;
            var dataacc = moment(accettazione, "DD/MM/YYYY HH:mm:ss").format("YYYYMMDD");
            var oraacc = moment(accettazione, "DD/MM/YYYY HH:mm:ss").format("HH:mm:ss");
            allRichieste[i].data_accettazione = allRichieste[i].data;
            allRichieste[i].ora_accettazione = oraacc;


            var conclusione = allRichieste[i].data_conclusione;
            var datacon = moment(conclusione, "DD/MM/YYYY HH:mm:ss").format("YYYYMMDD");
            var oracon = moment(conclusione, "DD/MM/YYYY HH:mm:ss").format("HH:mm:ss");
            allRichieste[i].data_conclusione = allRichieste[i].data;
            allRichieste[i].ora_conclusione = oracon;
        }
        if (allRichieste[i].status == 3) {
            var data = allRichieste[i].data;
            var ora = allRichieste[i].ora;
            allRichieste[i].data_eliminazione = data;
            allRichieste[i].ora_eliminazione = ora;
        }
        if (allRichieste[i].status == 4) {
            var data = allRichieste[i].data;
            var ora = allRichieste[i].ora;
            allRichieste[i].data_eliminazione = data;
            allRichieste[i].ora_eliminazione = ora;
        }

        if (!allRichieste[i].hasOwnProperty("movimenti")){
            allRichieste[i]["movimenti"] = new Array();
        }
        let updatato = await RICHIESTE.findByIdAndUpdate(allRichieste[i]._id, allRichieste[i]);
    }
}