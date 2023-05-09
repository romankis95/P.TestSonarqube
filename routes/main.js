const express = require("express");
const router = express.Router();
const UBICAZIONE = require("../models/ubicazione");
const logger = require("./extensions/logger");
const ZMAT = require("../models/zmat");
const middleware = require("../middleware");
const MAGAZZINI = require("./../models/magazzino/magazzino")


router.get("/", middleware.isLoggedIn, async function (req, res) {
    const magazzini = await MAGAZZINI.find().lean();
    return res.render("main", {
        magazzini: magazzini
    });
});


router.get("/search", middleware.isLoggedIn, async function (req, res) {
    console.log(req.query)
    var ricerca = req.query.RADIO || null;
    var magazzino = req.query.RDBMAGAZZINO || null;
    var risultati = [];
    var query = {};
    if (parseInt(ricerca) == 0) {
        var codice = req.query.SEARCH || null;
        if (codice) {
            codice = codice.toUpperCase();
            codice = codice.trim();
            codice = codice.toString();
            magazzino = parseInt(magazzino);
            if (magazzino == 0) {
                magazzino = req.user.magazzino.toString();
                query = {
                    articolo: {
                        $regex: ".*" + codice + ".*"
                    },
                    magazzino: magazzino
                };
            } else {
                query = {
                    articolo: {
                        $regex: ".*" + codice + ".*"
                    }
                };
            };
            try {
                risultati = await UBICAZIONE.find(query).limit(500).exec();
                return res.json(risultati);
            } catch (err) {
                logger.error(JSON.stringify(err.message));
                return res.json(null);
            };
        } else {
            return res.json(null);
        };
    } else if (parseInt(ricerca) == 1) {
        var ubicazione = req.query.SEARCH || null;
        if (ubicazione) {
            ubicazione = ubicazione.toUpperCase();
            ubicazione = ubicazione.trim();
            ubicazione = ubicazione.toString()
            if (magazzino == 0) {
                magazzino = req.user.magazzino.toString();
                query = {
                    magazzino: magazzino
                };
            } else {
                query = {};
            };
            query.ubicazione = {
                $regex: '.*' + ubicazione + '.*'
            };
            try {
                risultati = await UBICAZIONE.find(query).limit(10).exec();
                return res.json(risultati);
            } catch (err) {
                logger.error(JSON.stringify(err.message));
                return res.json(null);
            };
        } else {
            return res.json(null);
        };
    } else {
        return res.json(null);
    };
});



router.get("/search_inzmat", middleware.isLoggedIn, async function (req, res) {
    var query = req.query.materiale || null;
    if (query) {
        query = query.toUpperCase();
        try {
            var result = await ZMAT.findOne({
                "MATNR": query.toString()
            });
            if (result) {
                return res.json(result);
            } else {
                return res.json({
                    MATNR: '0000',
                    MAKTX: "Materiale non trovato in SAP, controllare il codice o proseguire."
                })
            }
        } catch (err) {
            logger.error(JSON.stringify(err.message));
            res.json(null);
        }
    } else {
        res.json(null);
    };
});

module.exports = router;