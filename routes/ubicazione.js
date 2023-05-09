const express = require("express");
const router = express.Router();
const UBICAZIONE = require("../models/ubicazione");
const MOVIMENTI = require("../models/movimenti");
const MAGAZZINI = require("../models/magazzino/magazzino");
const moment = require("moment");
const logger = require("./extensions/logger");
const sendmail = require("./extensions/nodemailer");
const ZMAT = require("../models/zmat");
const middleware = require("../middleware");
const axios = require("axios");
router.get('/:codice/', async function (req, res) {
    let codice = req.params.codice || null;

    if (codice) {
        codice = codice.trim();
        codice = codice.toUpperCase();
        try {
            var query_mag = await MAGAZZINI.find({}).lean();
            var magazzini = new Array();
            for (const element of query_mag) {
                magazzini.push(element.nome);
            }
            magazzini = [...new Set(magazzini)];
            const trovati = await UBICAZIONE.find({
                "articolo": codice.toString()
            }).lean()
            return res.render("singolo_articolo", {
                risultati: trovati,
                magazzini: magazzini,
                query: codice
            });
        } catch (error) {
            logger.error(error);
            return res.render("singolo_articolo", {
                risultati: [],
                magazzini: [],
                query: codice
            });
        }
    } else {
        return res.render("singolo_articolo", {
            risultati: [],
            magazzini: [],
            query: codice
        });
    }
});


router.post("/", middleware.isLoggedIn, async function (req, res) {
    let codice = req.body.inputcodice || null;
    let locazione = req.body.inputubicazione || null;
    let magazzino = req.body.selectmagazzino || null;
    let descrizione = req.body.inputdescrizione || null;
    let quantita = req.body.inputquantita || null;
    let validubicazione = /[a-zA-Z]{1}[0-9]{4}/.test(locazione);
    let desc = '';
    if (quantita) {
        quantita = parseInt(quantita);
    } else {
        quantita = 0;
    }

    if (codice && locazione) {
        codice = codice.toUpperCase();
        codice = codice.trim();
        locazione = locazione.toUpperCase();
        locazione = locazione.trim();
        if (validubicazione) {
            let anagrafica = await ZMAT.findOne({
                "MATNR": codice.toString()
            }).lean();

            if (anagrafica) {
                desc = anagrafica.MAKTX;
            } else if (descrizione) {
                desc = descrizione;
            } else {
                desc = "non trovato";
            }

            let armadio = locazione[0];
            let ripiano = locazione[1];
            let posizione = locazione[2] + locazione[3] + locazione[4];


            const newUbicazione = {
                armadio: armadio.toString(),
                ripiano: ripiano.toString(),
                posizione: posizione.toString(),
                descrizione: desc.toString(),
                articolo: codice.toString(),
                datapart: moment().format("YYYYMMDD"),
                datainserimento: moment().format("DD/MM/YYYY HH:mm:ss"),
                ubicazione: armadio.toString() + "" + ripiano.toString() + "" + posizione.toString(),
                magazzino: magazzino.toString(),
                quantita: quantita.toString(),
                dataultimaqta: moment().format("DD/MM/YYYY HH:mm:ss"),
                autoreultimaqta: req.user.username.toString()
            };

            try {
                await UBICAZIONE.create(newUbicazione);
                req.flash("success", "Hai ubicato " + codice + " nella posizione " + armadio + "" + ripiano + "" + posizione + "!")
            } catch (err) {
                logger.error(JSON.stringify(err.message));
                sendmail("Inserimento Ubicazione", JSON.stringify(err))
                req.flash("error", "Si è verificato un errore, Avviso Roman");
            }

            const movimento = {
                data: moment().format("DD/MM/YYYY HH:mm:ss"),
                datapart: moment().format("YYYYMMDD"),
                codicearticolo: codice.toString(),
                movimento: "add",
                ubicazione: armadio.toString() + "" + ripiano.toString() + "" + posizione.toString(),
                author: req.user,
                magazzino: magazzino.toString(),
                quantita: quantita.toString()
            };

            try {
                await MOVIMENTI.create(movimento);
                let url = "http://" + process.env.SERVER + ":" + process.env.SERVER + "/update/"
                await axios.get(url);
            } catch (err) {
                logger.error(JSON.stringify(err.message));
                sendmail("Inserimento Ubicazione", JSON.stringify(err))
            }
        } else {
            req.flash("warning", "Hai inserito un'ubicazione non conforme!")
        }
    } else {
        req.flash("warning", "Hai inserito dati non conformi!")
    }
    res.redirect("/principale");
});



router.get("/ajaxsearch", middleware.isLoggedIn, async function (req, res) {
    var codice = req.query.codice || null;
    var locazione = req.query.posizione || null;
    var magazzino = req.query.rdbmagazzino || null;
    if (codice && locazione && magazzino) {
        codice = codice.toUpperCase();
        codice = codice.trim();
        locazione = locazione.toUpperCase();
        locazione = locazione.trim();
        if (magazzino == 0) {
            magazzino = 0;
        } else if (magazzino == 1) {
            magazzino = 1;
        } else {
            magazzino = 1;
        }
        if (locazione.length == 5) {
            const armadio = locazione[0];
            const ripiano = locazione[1];
            const posizione = locazione[2] + locazione[3] + locazione[4];
            try {
                var x = await UBICAZIONE.find({
                    armadio: armadio.toString(),
                    ripiano: ripiano.toString(),
                    posizione: posizione.toString()
                });
                res.json({
                    codici: x,
                    err: null
                });
            } catch (err) {
                logger.error(JSON.stringify(err.message));
                req.flash("error", "Si è verificato un errore, Avviso Roman");
                res.json({
                    codici: null,
                    err: err
                });
            }
        } else {
            res.json({
                codici: null,
                err: null
            });
        }
    } else {
        res.json({
            codici: null,
            err: null
        });
    };
});


router.post("/update", middleware.isLoggedIn, async function (req, res) {
    var id = req.body.id;
    if (id) {
        var data = moment().format("DD/MM/YYYY HH:mm:ss");
        var datapart = moment().format("YYYYMMDD");
        try {
            await UBICAZIONE.findByIdAndUpdate(id, {
                "datapart": datapart,
                "datainserimento": data,
            });
            res.json("ok");
        } catch (error) {
            logger.error(JSON.stringify(error.message));
            res.json(error);
        };
    } else {
        res.json(false);
    }
});



router.post("/delete", middleware.isLoggedIn, async function (req, res) {
    var id = req.body.id;
    if (id) {
        try {
            var trovata = await UBICAZIONE.findById(id).lean().exec();
            if (trovata) {
                var eliminata = await UBICAZIONE.findByIdAndDelete(id);
                if (eliminata) {
                    var movimento = {
                        data: moment().format("DD/MM/YYYY HH:mm:ss"),
                        datapart: moment().format("YYYYMMDD"),
                        codicearticolo: trovata.articolo,
                        movimento: "remove",
                        ubicazione: trovata.armadio + "" + trovata.ripiano + "" + trovata.posizione,
                        author: req.user,
                        magazzino: trovata.magazzino
                    };
                    try {
                        await MOVIMENTI.create(movimento);
                    } catch (err) {
                        logger.error(JSON.stringify(err.message));
                        sendmail("Eliminazione Ubicazione", JSON.stringify(err))
                    }
                }
            }
        } catch (error) {
            logger.error(JSON.stringify(error.message));
            res.json(error);
        };
        res.json("ok");
    } else {
        res.json(null)
    }
});



module.exports = router;