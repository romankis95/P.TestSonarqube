const express = require("express");
const router = express.Router();
const RICHIESTE = require("../models/richieste.js");
const UBICAZIONI = require("../models/ubicazione");
const MARD = require("../models/mard");
const moment = require("moment");
const logger = require("./extensions/logger");
const middleware = require("../middleware/index.js");
const config = require("./../config/config.json");


router.get("/", middleware.isLoggedIn, async function (req, res) {
    const datainizio = req.query.datainizio || moment().format("YYYYMMDD");
    const datafine = req.query.datafine || moment().format("YYYYMMDD");
    const urgenzemagazzino = config.urgenzemagazzino;
    let query = {};
    if (req.user.isAdmin) {
         query = {
            data: {
                $lte: datafine.toString().trim(),
                $gte: datainizio.toString().trim()
            },
        };
    } else {
         query = {
            $or: [{
                data: {
                    $lte: datafine.toString(),
                    $gte: datainizio.toString()
                },
                $or: [{
                    magazzino: req.user.magazzino.toString()
                }, {
                    magazzino: "ALL"
                }]
            }, {
                status: {
                    $lte: 1
                },
                $or: [{
                    magazzino: req.user.magazzino.toString()
                }, {
                    magazzino: "ALL"
                }]
            }]
        };
    }
    try {
        const dati = await RICHIESTE.find(query).lean();
        for (const element of dati) {
            element.urgenza = urgenzemagazzino[element.urgenza];
        }
        const ubicazioni = await UBICAZIONI.find({
            magazzino: req.user.magazzino.toString()
        }, {
            ubicazione: 1,
            articolo: 1
        }).lean().exec();
        ubicazioni.sort((a, b) => {
            return a.datapart - b.datapart;
        });
        for (const element of dati) {
            element["ubicazione"] = new Array();
            element.codice = element.codice.trim();
            if (element.status === "1" || element.status === "0") {
                for (let j = 0; j < ubicazioni.length; j++) {
                    if (ubicazioni[j].articolo.toString() == element.codice.toString()) {
                        element["ubicazione"].push(ubicazioni[j].ubicazione.toString());
                    };
                };
                element["stock"] = new Object();
                element["codice"] = element["codice"].trim();
                element["stock"] = await MARD.findOne({
                    "MATNR": element["codice"].toString().trim().toUpperCase()
                }).lean();
            }
        };
        return res.render("richieste", {
            dati: dati,
            datainizio: datainizio,
            datafine: datafine,
            err: false
        });
    } catch (err) {
        logger.error(err.message)
        return res.render("richieste", {
            dati: [],
            datafine: datafine,
            datainizio: datainizio,
            err: true
        });
    }
});


router.post("/", function (req, res) {
    const dp = req.body.datefilter;
    const datedivise = dp.split("-");
    let datainizioDP = moment(datedivise[0], 'DD/MM/YYYY').format('YYYYMMDD');
    let datafineDP = moment(datedivise[1], 'DD/MM/YYYY').format('YYYYMMDD');
    return res.redirect("/richieste/?datainizio=" + datainizioDP + "&datafine=" + datafineDP);
});






module.exports = router;