const schedule = require("node-schedule");
const express = require("express");
const router = express.Router();

const logger = require("../extensions/logger")
const ip = require('ip');
const moment = require("moment");
const myip = ip.address();


const MARD = require("../../models/mard");
module.exports = router;









router.get("/onoff", function (req, res) {
    if (process.env.FUNCTION_UPDATE_STOCK == true || process.env.FUNCTION_UPDATE_STOCK == "true") {
        process.env.FUNCTION_UPDATE_STOCK = false;
    } else {
        process.env.FUNCTION_UPDATE_STOCK = true;
    };
    res.redirect("back");
});




async function getUpdatedStockFromData() {
    const pool = new noderfc.Pool({
        connectionParameters: {
            dest: "MME"
        },
        poolOptions: {
            low: 2,
            high: 4
        }, // optional
    });


    (async () => {
        try {
            const client = await pool.acquire();
            const abap_structure = {
                RFCINT4: 345,
                RFCFLOAT: 1.23456789,
                RFCCHAR4: "ABCD",
                RFCDATE: "20180625", // ABAP date format
            };
            // ABAP table
            let abap_table = [abap_structure];
            const result = await client.call("STFC_STRUCTURE", {
                IMPORTSTRUCT: abap_structure,
                RFCTABLE: abap_table,
            }, {
                timeout: 5
            });
            var keys = ["MATNR", "LGORT", "LABST", "INSME"];

            client.invoke('RFC_READ_TABLE', {
                    QUERY_TABLE: 'MARD',
                    FIELDS: [{
                            FIELDNAME: "MATNR", // codice materiale
                        },
                        {
                            FIELDNAME: "LGORT", // magazzino 1010
                        },
                        {
                            FIELDNAME: "LABST", // IN STOCK
                        },
                        {
                            FIELDNAME: "INSME", // IN CQ
                        },
                    ],
                    DELIMITER: "|",
                    OPTIONS: [{
                        "TEXT": "LGORT = '1010'"
                    }]
                },
                async function (err, dati) {
                    if (err) {
                        logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify(err)));
                        pool.release(client)
                        logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify("Errore durante la lettura della MARD, durante una call automatica #1!")));

                    } else {
                        if (dati) {
                            if (dati.hasOwnProperty("DATA")) {
                                logger.info(JSON.stringify("::ffff:" + myip + " , " + "Sono stati recuperati " + dati.DATA.length + " dati"));
                                logger.info(JSON.stringify("::ffff:" + myip + " , " + "Inizio ad inserire i dati dentro la tabella di mongodb."));
                                var parsato = rfc_parser(keys, dati);
                                pool.release(client)
                                var svuoto = await MARD.deleteMany();
                                var inserisco = await MARD.insertMany(parsato);
                                logger.info(JSON.stringify("::ffff:" + myip + " , " + "Finito di inserire i dati dentro la tabella di mongodb."));
                                return true;
                            } else {
                                logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify("Errore durante la lettura della MARD, durante una call automatica #3!")));
                                return false;
                            }
                        } else {
                            logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify("Manca la chiave 'DATA' nella risposta di sap")));
                            pool.release(client);
                            return false;
                        };
                    };
                });
        } catch (err) {
            logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify(err)));
            logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify("Errore durante la lettura della MARD, durante una call automatica #2!")));

            pool.release(client);
            return false;
        }
    })();





    function rfc_parser(keys, dati) {
        var final = new Array();
        for (let i = 0; i < dati.DATA.length; i++) {
            final[i] = new Object();
            var ans = dati.DATA[i].WA.toString().split("|");
            for (let j = 0; j < keys.length; j++) {
                final[i][keys[j]] = ans[j].trim();
            };
        };
        return final;
    };

















};