const express = require("express");
const router = express.Router();
const middleware = require("../middleware");
const logger = require("../routes/extensions/logger");
const MOVIMENTI = require("../models/movimenti");
const moment = require("moment");
const querystring = require('querystring');



router.get("/", middleware.isLoggedIn, async function (req, res) {
    try {
        let materiale = req.query.materiale || null;
        if (materiale === "") {
            materiale = null;
        }else{
            materiale = materiale.toString();
        }
        let inizio = req.query.inizio || moment().format("YYYYMMDD");
        let fine = req.query.fine || moment().format("YYYYMMDD");
        let query = {}
        if (materiale) {
            query = {
                'codicearticolo': materiale.toString()
            }
        } else {
            inizio = inizio.toString().trim().substring(8)
            fine = fine.toString().trim().substring(8)
            query = {
                'datapart': {
                    '$gte': inizio,
                    '$lte': fine
                }
            }
        }
        const movimenti = await MOVIMENTI.find(query).lean();

        inizio = moment(inizio, "YYYYMMDD").format("DD/MM/YYYY");
        fine = moment(fine, "YYYYMMDD").format("DD/MM/YYYY");

        return res.render("movimenti", {
            'materiale': materiale,
            'dati': movimenti,
            'inizio': inizio,
            'fine': fine
        });
    } catch (err) {
        req.flash("error", "Si è verificato un errore, avviso Roman.");
        logger.error(JSON.stringify(err.message));
        return res.render("movimenti", {
            'dati': null,
            'inizio': null,
            'fine': null,
            'materiale': null
        });
    }
});


router.post('/', function (req, res, next) {
    let datedivise = [];
    const dp = req.body.datefilter;
    datedivise = dp.split("-");
    const datainizioDP = moment(datedivise[0], 'DD/MM/YYYY').format('YYYYMMDD');
    const datafineDP = moment(datedivise[1], 'DD/MM/YYYY').format('YYYYMMDD');
    const materiale = req.body.materiale || null;
    let query = {}
    if (materiale) {
         query = querystring.stringify({
            "inizio": datainizioDP.toString(),
            "fine": datafineDP.toString(),
            "materiale": materiale.trim().toUpperCase().toString()
        });
    } else {
         query = querystring.stringify({
            "inizio": datainizioDP,
            "fine": datafineDP,
        });
    }
    req.flash("success", "Ricerca eseguita!")
    res.redirect('/movimenti?' + query);
});



module.exports = router;