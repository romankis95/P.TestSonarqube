/**librerie */
const express = require("express");
const router = express.Router();
const ip = require('ip');
const myip = ip.address();
const moment = require("moment");

/**Database */
const MARD = require("../../../models/mard");
/**extensions+middleware */
const logger = require("../../extensions/logger");


module.exports = router;
/**
 * localhost/api/sendmagazzino 
 * Questa funzione restituisce l'intero magazzino sottoforma di json
 * se errore, restituisce data:null
 * 
 */
router.get("/sendmagazzino", async function (req, res) {
    try {
        var allmagazzino = await MARD.find({}).lean();
        res.json({
            data: allmagazzino,
            time: moment().toISOString()
        })
    } catch (error) {
        logger.error(JSON.stringify(error.message));
        res.json({
            data: null,
            time: moment().toISOString()
        })
    }
});

/**
 * localhost/api/askmagazzino?codice=codicearticolo
 * Questa funzione riceve una query e restituisce il documento intero 
 * che trova in tabella, se errore o query non corretta restituisce null
 */
router.get("/askmagazzino/", async function (req, res) {
    var codice = req.query.codice || null;
    if (codice) {
        codice = codice.trim().toUpperCase();
        try {
            var risultato = await MARD.findOne({
                MATNR: codice.toString()
            }).lean();
            return res.json({
                risultati: risultato
            });
        } catch (error) {
            logger.error(JSON.stringify(error.message));
            return res.json({
                risultati: null
            });
        }
    } else {
        return res.json({
            risultati: null
        })
    }
});