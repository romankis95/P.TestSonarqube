const express = require('express');
const router = express.Router();
const moment = require('moment');
const axios = require('axios');
const logger = require('../../../extensions/logger');
const USERS = require("./../../../../models/user");
const UBICAZIONI = require('./../../../../models/ubicazione');
const MARD = require('./../../../../models/mard');

module.exports = router;



router.post("/stampainventario/:id/:username", async (req, res) => {
    try {

        var ubicazione = await UBICAZIONI.findById(req.params.id).lean();


        const user = await USERS.findById(req.params.username).lean();
        if (user) {


            if (ubicazione) {
                const url = 'http://192.168.1.143:8000/Integration/InventarioTestEtichette/Execute';
                var data = {
                    printername: 'Brother MFC-L2710DN series Printer',
                    codicearticolo: ubicazione.articolo,
                    datainventario: moment().format('DD/MM/YYYY'),
                    datalotto: moment(ubicazione.datapart, 'YYYYMMDD').format('DD/MM/YYYY'),
                    descrizione: ubicazione.descrizione,
                    magazzino: ubicazione.magazzino,
                    quantita: ubicazione.quantita,
                    utente: user.username,
                    ubicazione: ubicazione.ubicazione,
                }

                await axios.post(url, data).then((responce) => {

                        logger.info(JSON.stringify(ubicazione.articolo));
                        return res.json({
                            status: true,
                            error: null,
                            responce: responce.data
                        });
                    })
                    .catch((error) => {
                        logger.error(JSON.stringify(error.message));

                        return res.json({
                            type: "error",
                            message: error.message,
                            data: null
                        });
                    });






            } else {
                return res.status(200).json({
                    type: "error",
                    message: "Ubicazione non trovata",
                    data: null
                });
            }
        } else {
            return res.status(200).json({
                type: "error",
                message: "Utente non trovato",
                data: null
            });
        }
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({
            message: "Server Error"
        });
    }
});


router.get("/getubi/:id", async (req, res) => {
    try {
        let ubicazione = await UBICAZIONI.findById(req.params.id).lean();


        if (ubicazione) {
            const stockk = await MARD.findOne({
                'MATNR': ubicazione.articolo,
            }).lean();

            ubicazione.stock = stockk;
            return res.status(200).json({
                type: 'success',
                error: null,
                data: ubicazione
            });
        } else {
            return res.status(200).json({
                type: "error",
                message: "Ubicazione non trovata",
                data: null
            });
        }
    } catch (error) {
        logger.error(error.message);
       return res.status(200).json({
            type: "error",
            message: "Server Error"
        });
    }
});


router.get("/inv/reparto/:reparto", async (req, res) => {
     if(req.params.reparto == 'MOTORI'){
        var ubicazioni = await UBICAZIONI.find({
            'magazzino': 'MOTORI',
            armadio: {
                $in: ['A', 'B','C','D','E','F','M','X']
            }
        }).lean();
        return res.render("pernives", {
            risultati: ubicazioni
        })
    } else if (req.params.reparto == 'STOCKAGGIO') {
     var ubicazioni = await UBICAZIONI.find({
         'magazzino': 'STOCKAGGIO',
         armadio: {
             $in: ['A', 'B', 'C', 'D', 'E', 'F', 'G','H','I','P']
         }
     }).lean();
     return res.render("pernives", {
         risultati: ubicazioni
     })
    } else if (req.params.reparto == 'BRACCI') {

    } else if (req.params.reparto == 'PIASTRE') {

    } else if (req.params.reparto == 'TRANCERIA') {

    }else {
        return res.render("/pernives", {
            risultati: null
        })
    }
});