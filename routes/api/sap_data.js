/**librerie */
const express = require("express");
const router = express.Router();
const ip = require('ip');
const myip = ip.address();
const moment = require("moment");



/**Database */
const UBICAZIONE = require("../../models/ubicazione");
const SAP = require("../../models/sap");

/**extensions+middleware */
const sendmail = require("../extensions/nodemailer");
const logger = require("../extensions/logger");
//todo sarebbe carino fare un middleware stile isLoggedInFromDart()
module.exports = router;


router.get("/getsap", async function (req, res) {
    try {
        var dati = await SAP.find().lean().exec();
        var ubicazioni = await UBICAZIONE.find({}, {
            ubicazione: 1,
            articolo: 1
        }).lean().exec();
        for (let i = 0; i < dati.length; i++) {
            dati[i]["ubicazione"] = new Array();
            dati[i].MATNR = dati[i].MATNR.trim();
            for (let j = 0; j < ubicazioni.length; j++) {
                if (ubicazioni[j].articolo.toString() == dati[i].MATNR.toString()) {
                    dati[i]["ubicazione"].push(ubicazioni[j].ubicazione.toString());
                };
            };
        };
        let cleaned_out = new Array();
        for (let i = 0; i < dati.length; i++) {
            dati[i].LABST = parseInt(dati[i].LABST);
            if (dati[i].STATO != "L" && dati[i].STATO != "2" && dati[i].STATO != 2) {
                cleaned_out.push(dati[i]);
            }
        };
        return res.json({
            "type": "success",
            "dati": cleaned_out
        });
    } catch (err) {
        logger.error(JSON.stringify(err.message));
        sendmail("flutter api get sap data#1", JSON.stringify(err))
        return res.json({
            type: "error",
            message: "",
            data: null
        });
    }

});

router.post("/updatesap", function (req, res) {
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
            var keys = ["MANDT", "NUM_PROT",
                "MATNR", "MAKTX",
                "LABST", "MEINS", "QTA_ELABORATA", "ICON_URG", "LIV_URGEN", "DESC_LIV_U", "DATUM_I", "UZEIT_I", "UNAME_I", "DATUM_M", "UZEIT_M", "UNAME_M", "STATO", "DESC_STATO", "NOTE"
            ];
            var data = "'" + moment().format("YYYYMMDD") + "'"
            client.invoke('RFC_READ_TABLE', {
                    QUERY_TABLE: 'ZPP_LP_DB',
                    FIELDS: [{
                            FIELDNAME: "MANDT", //
                        },
                        {
                            FIELDNAME: "NUM_PROT", //
                        },
                        {
                            FIELDNAME: "MATNR", //
                        },
                        {
                            FIELDNAME: "MAKTX", //
                        },
                        {
                            FIELDNAME: "LABST", //
                        },
                        {
                            FIELDNAME: "MEINS", //
                        },
                        {
                            FIELDNAME: "QTA_ELABORATA", //
                        },
                        {
                            FIELDNAME: "ICON_URG", //
                        },
                        {
                            FIELDNAME: "LIV_URGEN", //
                        },
                        {
                            FIELDNAME: "DESC_LIV_U", //
                        },
                        {
                            FIELDNAME: "DATUM_I", //
                        },
                        {
                            FIELDNAME: "UZEIT_I", //
                        },
                        {
                            FIELDNAME: "UNAME_I", //
                        },
                        {
                            FIELDNAME: "DATUM_M", //
                        },
                        {
                            FIELDNAME: "UZEIT_M", //
                        },
                        {
                            FIELDNAME: "UNAME_M", //
                        },
                        {
                            FIELDNAME: "STATO", //
                        },
                        {
                            FIELDNAME: "DESC_STATO", //
                        },
                        {
                            FIELDNAME: "NOTE", //
                        },
                    ],
                    DELIMITER: "|",
                    OPTIONS: [{
                        "TEXT": "DATUM_I >= " + data + "" // dovrei personalizzare questo campo, userò moment con variabile e stringa
                    }]
                },
                async function (err, dati) {
                    if (err) {
                        logger.error(JSON.stringify("::ffff:" + myip + " , " + err));
                        return res.json({
                            type: "error",
                            message: "",
                            data: null
                        });
                    } else {
                        if (dati) {
                            if (dati.hasOwnProperty("DATA")) {
                                logger.info(JSON.stringify("::ffff:" + myip + " , " + "Sono stati recuperati " + dati.DATA.length + " dati"));
                            }
                            var parsato = rfc_parser(keys, dati);
                            try {
                                var svuotato = await SAP.deleteMany();
                                logger.info(JSON.stringify("::ffff:" + myip + " , " + "Svuotato il database SAP"));
                                var inserito = await SAP.create(parsato);
                                logger.info(JSON.stringify("::ffff:" + myip + " , " + "Riempito il database SAP"));
                                process.env.saplistaaggiornamento = moment().format("DD/MM/YYYY HH:mm:ss");
                                pool.release(client)
                                return res.json({
                                    type: "success",
                                    message: "",
                                    data: null
                                });
                            } catch (err) {
                                logger.error(JSON.stringify("::ffff:" + myip + " , " + err));
                                return res.json({
                                    type: "error",
                                    message: "",
                                    data: null
                                });
                            };
                        };
                    };
                });
        } catch (err) {
            logger.error(JSON.stringify("::ffff:" + myip + " , " + err));
            return res.json({
                type: "error",
                message: "",
                data: null
            });
        }
    })();
});


function rfc_parser(keys, dati) {
    var final = new Array();
    for (let i = 0; i < dati.DATA.length; i++) {
        final[i] = new Object();
        var ans = dati.DATA[i].WA.toString().split("|");
        for (let j = 0; j < keys.length; j++) {
            final[i][keys[j]] = ans[j];
        };
    };
    return final;
};