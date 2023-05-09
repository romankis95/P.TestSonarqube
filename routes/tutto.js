const express = require("express");

const router = express.Router();
const User = require("../models/user")
const UBICAZIONE = require("../models/ubicazione");
const moment = require("moment");
const logger = require("./extensions/logger");
const sendmail = require("./extensions/nodemailer");
const middleware = require("../middleware");
const MOVIMENTI = require("../models/movimenti");
const MAGAZZINI = require("./../models/magazzino/magazzino");
const MARD = require("./../models/mard");

router.get("/", middleware.isLoggedIn, async function (req, res) {
    var query = {};
    var test = false;
    var attuale = null;
    try {
        var query_mag = await MAGAZZINI.find({}).lean();
        var magazzini = new Array();
        for (let i = 0; i < query_mag.length; i++) {
            magazzini.push(query_mag[i].nome);
        }
        magazzini = [...new Set(magazzini)];
        if (typeof req.query.magazzino !== 'undefined' && req.query.magazzino) {
            attuale = req.query.magazzino.toString()
            for (let i = 0; i < magazzini.length; i++) {
                if (magazzini[i] == attuale) {
                    test = true;
                    break;
                }
            }
        }
        if (test) {
            query = {
                "magazzino": attuale.toString()
            }
        }
        var inserito = await UBICAZIONE.find(query)
        return res.render("interomagazzino/tutto", {
            risultati: inserito,
            magazzini: magazzini,
            attuale: attuale
        });
    } catch (err) {
        req.flash("error", "Si è verificato un problema, avviso Roman!")
        logger.error(JSON.stringify(err.message));
        return res.render("interomagazzino/tutto", {
            risultati: null,
            magazzini: null,
            attuale: null
        });
    }
});



router.get("/sommati", middleware.isLoggedIn, async function (req, res) {
    var ubicazioni = await UBICAZIONE.find({}).lean();
    var articoli = new Array();
    for (let i = 0; i < ubicazioni.length; i++) {
        articoli.push(ubicazioni[i].articolo);
    }
    articoli = [...new Set(articoli)];
    var risultati = new Array();
    for (let i = 0; i < articoli.length; i++) {
        let somma = 0;
        let posizioni = new Array();
        for (let j = 0; j < ubicazioni.length; j++) {
            if (articoli[i] == ubicazioni[j].articolo) {
                let qta = 0;
                if (isNaN(ubicazioni[j].quantita)) {
                    qta = 0;
                } else {
                    qta = ubicazioni[j].quantita;
                }
                somma += qta;
                posizioni.push({
                    magazzino: ubicazioni[j].magazzino,
                    armadio: ubicazioni[j].armadio,
                    ripiano: ubicazioni[j].ripiano,
                    posizione: ubicazioni[j].posizione,
                    dataultimaqta: ubicazioni[j].dataultimaqta,
                    autoreultimaqta: ubicazioni[j].autoreultimaqta
                });
            }
        }
        if (isNaN(somma)) {
            somma = 0;
        }

        risultati.push({
            'articolo': articoli[i],
            'descrizione': ubicazioni[i].descrizione,
            'somma': somma,
            'posizioni': posizioni,
            'LABST': 0,
        });
    }
    const mard = await MARD.find().lean();

    for (const element of mard) {
        element['LABST'] = parseInt(element['LABST'], 10)
        if(isNaN(element['LABST'])){
            
            element['LABST'] = 0;
        }
        for (let i = 0; i < risultati.length; i++) {
            if (element.MATNR === risultati[i].articolo) {
                risultati[i]['LABST'] = element['LABST']
                risultati[i]['INSME'] = element['INSME']
                risultati[i]['LGORT'] = element['LGORT']
            }
        }
    }
    return res.render("inventario/tutto_sommato", {
        risultati: risultati
    });
});




router.post("/", function (req, res) {
    var magazzino = req.body.selectmagazzino;
    return res.redirect("/inventario/?magazzino=" + magazzino)
});

router.get("/rimuovi/:id/", middleware.isLoggedIn, async function (req, res) {
    try {
        await User.findOne({
            "username": req.user.username.toString()
        }).lean();
       await UBICAZIONE.findOne({
            "_id": req.params.id.toString()
        });
        var movimento = {
            data: moment().format("DD/MM/YYYY HH:mm:ss"),
            datapart: moment().format("YYYYMMDD"),
            codicearticolo: x.articolo,
            movimento: "remove",
            ubicazione: x.armadio + "" + x.ripiano + "" + x.posizione,
            author: user,
            magazzino: x.magazzino
        };
        // eslint-disable-next-line no-unused-vars
        await UBICAZIONE.deleteOne({
            "_id": req.params.id
        });
        try {
            // eslint-disable-next-line no-unused-vars
            let creatoMovimento = await MOVIMENTI.create(movimento);
        } catch (err) {
            logger.error(JSON.stringify(err.message));
            sendmail("Eliminazione Ubicazione", JSON.stringify(err))
        }
        req.flash("success", "Eliminato!")
    } catch (err) {
        req.flash("error", "Si è verificato un problema, avviso Roman!")
        logger.error(JSON.stringify(err.message));
    } finally {
        res.redirect("back")
    }
});


router.get("/ajaxsearch/:id/", async function (req, res) {
    const id = req.params.id || null;
    if (id) {
        try {
            let ubicazione = await UBICAZIONE.findById(id);
            return res.json(ubicazione)
        } catch (error) {
            return res.json(null);
        }
    } else {
        return res.json(null);
    }
});


router.post("/modifica/:id/", async function (req, res) {
    let codice = req.body.txtarticolo || null;
    let locazione = req.body.txtubicazione || null;
    let txtdescrizione = req.body.txtdescrizione || null;
    let txtdata = req.body.txtdata || null;
    let magazzino = req.body.selectmagazzinomodal || null;
    let quantita = req.body.txtqta || null;
    let um = req.body.selectum || null;
    let data = moment(txtdata, "YYYY-MM-DD").format("YYYYMMDD");
    let dataintera = moment(txtdata, "YYYY-MM-DD").format("DD/MM/YYYY");
    let ora = moment().format("HH:mm:ss")


    if (!codice) {
        req.flash("error", "Ci sono dei dati errati!");
        return res.json({
            type: "error",
            message: "Ci sono dei dati errati!"
        })
    }
    if (!locazione) {
        req.flash("error", "Ci sono dei dati errati!");
        return res.json({
            type: "error",
            message: "Ci sono dei dati errati!"
        })
    }
    if (!txtdescrizione) {
        req.flash("error", "Ci sono dei dati errati!");
        return res.json({
            type: "error",
            message: "Ci sono dei dati errati!"
        })
    }
    if (!txtdata) {
        req.flash("error", "Ci sono dei dati errati!");
        return res.json({
            type: "error",
            message: "Ci sono dei dati errati!"
        })
    }


    if (codice && locazione) {
        codice = codice.toUpperCase();
        codice = codice.trim();
        locazione = locazione.toUpperCase();
        locazione = locazione.trim();
        if (locazione.length == 5) {
            let anagrafica = null;
            if (anagrafica) {
                descrizione = anagrafica.MAKTX;
            } else {
                descrizione = txtdescrizione;
            }
            const armadio = locazione[0];
            const ripiano = locazione[1];
            const posizione = locazione[2] + locazione[3] + locazione[4];
            const newData = {
                armadio: armadio,
                ripiano: ripiano,
                posizione: posizione,
                descrizione: descrizione,
                articolo: codice,
                datapart: data,
                um: um,
                quantita: quantita,
                datainserimento: dataintera + " " + ora,
                ubicazione: armadio + "" + ripiano + "" + posizione,
                magazzino: magazzino,
                dataultimaqta: moment().format("DD/MM/YYYY HH:mm:ss"),
                autoreultimaqta: req.user.username
            };
            try {
              await UBICAZIONE.findByIdAndUpdate(req.params.id, newData, {
                    new: true
                });
                req.flash("success", "Hai modificato " + codice + " nella posizione " + armadio + "" + ripiano + "" + posizione + "!")
            } catch (err) {
                logger.error(JSON.stringify(err.message));
                sendmail("Inserimento Ubicazione", JSON.stringify(err))
                req.flash("error", "Si è verificato un errore, Avviso Roman");
            }
            const movimento = {
                data: moment().format("DD/MM/YYYY HH:mm:ss"),
                datapart: moment().format("YYYYMMDD"),
                codicearticolo: codice.toString(),
                movimento: "edit",
                ubicazione: armadio.toString() + "" + ripiano.toString() + "" + posizione.toString(),
                author: req.user,
                magazzino: magazzino.toString()
            }
            try {
                await MOVIMENTI.create(movimento);
            } catch (err) {
                logger.error(JSON.stringify(err.message));
                sendmail("Inserimento Ubicazione", JSON.stringify(err))
                req.flash("error", "Si è verificato un errore, Avviso Roman");
            }
            return res.json({
                type: "success",
                message: "Hai modificato " + codice + " nella posizione " + armadio + "" + ripiano + "" + posizione + "!",
                data: updatato

            });
        } else {
            req.flash("warning", "Hai inserito una posizione non conforme!")
        }
    } else {
        req.flash("warning", "Hai inserito dati non conformi!")
    }
    return res.json({
        type: "error",
        message: "Ci sono dei dati errati!"
    })
});


module.exports = router;