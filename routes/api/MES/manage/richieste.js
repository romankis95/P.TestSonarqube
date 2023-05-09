/* eslint-disable no-unused-vars */
/**librerie */
const express = require("express");
const router = express.Router();
const ip = require('ip');
const moment = require("moment-timezone");
const axios = require("axios");

const USER = require("./../../../../models/user")
const myip = ip.address();
/**Database */
const UBICAZIONE = require("./../../../../models/ubicazione");
/**extensions+middleware */
const logger = require("./../../../extensions/logger");
//todo sarebbe carino fare un middleware stile isLoggedInFromDart()
const Richieste = require("./../../../../models/richieste");
let url = "http://" + process.env.SERVER + ":" + process.env.SOCKET + "/update/"
module.exports = router;

/**
 * la richiesta di materiale dal mes arriva qui, e deve essere validata.
 * 
 * 
 * 
 */
const FISSI = require('./../../../../models/codicifissi')
router.post("/matrequest", async function (req, res) {
    let codMotori = []
    const codiciMotori = await FISSI.find({
        "magazzino": "MOTORI"
    }).select('codice -_id').lean();
    let codStockaggio = []
    const codiciStockaggio = await FISSI.find({
        "magazzino": "STOCKAGGIO"
    }).select('codice -_id').lean();
    for (let i = 0; i < codiciMotori.length; i++) {
        codMotori.push(codiciMotori[i].codice)
    }
    for (let i = 0; i < codiciStockaggio.length; i++) {
        codStockaggio.push(codiciStockaggio[i].codice)
    }


    let codice = req.body.codice || null;
    let description = req.body.description || null;
    let qta = req.body.qta || null;
    let urgenza = req.body.urgenza || null;
    let richiedente = req.body.richiedente || null;
    let tempo = req.body.tempo || null;
    let note = req.body.note || null;
    if (tempo == null) {
        tempo = moment().toISOString();
    }
    var magazzino = "STOCKAGGIO";
    //todo SCEGLIERE MAGAZZINO IN BASE AL MATERIALE....... IO DIREI 1 STOCKAGGIO 2 FABBRIZZIO 3 TUTTI....?
    if (codice && description && qta && richiedente && tempo) {

        if (urgenza == null) {
            urgenza = 0;
        }
        codice = codice.toUpperCase().trim();
        var date = moment(tempo);
        var data = date.format('YYYYMMDD');
        var ora = date.tz('Europe/Rome').format('HH:mm:ss');
        var ubicazioni = await UBICAZIONE.find({
            "articolo": codice.toString()
        }).lean();



        const pool = new noderfc.Pool({
            connectionParameters: {
                dest: "MME"
            },
            poolOptions: {
                low: 2,
                high: 4
            }, // optional
        });
        richiedente = JSON.parse(richiedente);
        if (richiedente.codicereparto.nomereparto.toUpperCase() === "BRACCI" || richiedente.codicereparto.nomereparto.toUpperCase() === "TRANCERIA") {
            magazzino = "STOCKAGGIO";
        } else if (codMotori.includes(codice)) {
            magazzino = "MOTORI"
        } else if (codStockaggio.includes(codice)) {
            magazzino = "STOCKAGGIO"

        } else if (ubicazioni.length > 0) {
            ubicazioni.sort(function (a, b) {
                return a.datapart - b.datapart;
            });
            magazzino = "ALL"


            for (let i = 0; i < ubicazioni.length; i++) {
                if (ubicazioni[i].magazzino == "MOTORI") {
                    magazzino = "MOTORI"
                } else if (ubicazioni[i].magazzino === "STOCKAGGIO") {
                    magazzino = "STOCKAGGIO"
                }
            }
            if (magazzino === "MOTORI") {
                magazzino = "MOTORI";
            } else if (magazzino === "STOCKAGGIO") {
                magazzino = "STOCKAGGIO";
            } else {
                magazzino = "ALL";
            }

        } else {
            /**
             * Caso C:: ordina un utente motori / piastre
            Ordina il codice C18.017260
            Il codice non risulta ubicato da nessuna parte..
            A chi mando ?
                ad entrambi
             * 
             * 
             */
            magazzino = "ALL";
        }



        (async () => {
            try {
                const client = await pool.acquire();
                const abap_structure = {
                    RFCINT4: 345,
                    RFCFLOAT: 1.23456789,
                    RFCCHAR4: "ABCD",
                    RFCDATE: "20180625", // ABAP date format
                };
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
                            "TEXT": "MATNR = '" + codice + "' AND LGORT = '1010'"
                        }]
                    },
                    async function (err, dati) {
                        if (err) {
                            logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify(err)));
                            pool.release(client)
                            var NewData = {
                                data: data,
                                ora: ora,
                                codice: codice,
                                description: description,
                                qta: qta,
                                note: note,
                                urgenza: urgenza,
                                richiedente: richiedente,
                                status: 0,
                                magazzino: magazzino,
                                stock: {},
                                movimenti: {
                                    tipo: "ricevuta da " + magazzino,
                                    data: moment().format("YYYYMMDD"),
                                    ora: moment().format("HH:mm:ss"),
                                    user: null
                                }
                            };


                            let insert = await Richieste.create(NewData);
                            try {

                                await axios.get(url);
                            } catch (err) {
                                logger.error(JSON.stringify(err.message));
                            }
                            return res.json({
                                type: "success",
                                message: "Inserito nelle richieste del magazzino",
                                data: null
                            });

                        } else {
                            if (dati) {
                                if (Object.prototype.hasOwnProperty.call(dati, "DATA")) {
                                    logger.info(JSON.stringify("::ffff:" + myip + " , " + "Sono stati recuperati " + dati.DATA.length + " dati"));
                                    var parsato = rfc_parser(keys, dati);
                                    pool.release(client)
                                    if (parsato.length > 0) {
                                        var NewData = {
                                            data: data,
                                            ora: ora,
                                            codice: codice,
                                            description: description,
                                            qta: qta,
                                            note: note,
                                            urgenza: urgenza,
                                            richiedente: richiedente,
                                            status: 0,
                                            magazzino: magazzino,
                                            stock: parsato[0],
                                            movimenti: {
                                                tipo: "ricevuta da " + magazzino,
                                                data: moment().format("YYYYMMDD"),
                                                ora: moment().format("HH:mm:ss"),
                                                user: null
                                            }
                                        };
                                    } else {
                                        var NewData = {
                                            data: data,
                                            ora: ora,
                                            codice: codice,
                                            description: description,
                                            qta: qta,
                                            note: note,
                                            urgenza: urgenza,
                                            richiedente: richiedente,
                                            status: 0,
                                            magazzino: magazzino,
                                            stock: {},
                                            movimenti: {
                                                tipo: "ricevuta da " + magazzino,
                                                data: moment().format("YYYYMMDD"),
                                                ora: moment().format("HH:mm:ss"),
                                                user: null
                                            }
                                        };
                                    }
                                    let insert = await Richieste.create(NewData);
                                    try {

                                        
                                        await axios.get(url);
                                    } catch (err) {
                                        logger.error(JSON.stringify(err.message));
                                    }
                                    return res.json({
                                        type: "success",
                                        message: "Inserito nelle richieste del magazzino",
                                        data: null
                                    });


                                } else {
                                    logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify("Manca la chiave 'DATA' nella risposta di sap")));
                                    pool.release(client)
                                    var NewData = {
                                        data: data,
                                        ora: ora,
                                        codice: codice,
                                        description: description,
                                        qta: qta,
                                        note: note,
                                        urgenza: urgenza,
                                        richiedente: richiedente,
                                        status: 0,
                                        magazzino: magazzino,
                                        stock: {},
                                        movimenti: {
                                            tipo: "ricevuta da " + magazzino,
                                            data: moment().format("YYYYMMDD"),
                                            ora: moment().format("HH:mm:ss"),
                                            user: null
                                        }
                                    };
                                    let insert = await Richieste.create(NewData);
                                    try {

                                        
                                        await axios.get(url);
                                    } catch (err) {
                                        logger.error(JSON.stringify(err.message));
                                    }
                                    return res.json({
                                        type: "success",
                                        message: "Inserito nelle richieste del magazzino",
                                        data: null
                                    });
                                };
                            };
                        };
                    });
            } catch (err) {
                logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify(err)));
                pool.release(client)
                var NewData = {
                    data: moment(data.toString(), "YYYYMMDD").format("DD/MM/YYYY"),
                    ora: ora.toString(),
                    codice: codice.toString(),
                    description: description.toString(),
                    qta: qta.toString(),
                    note: note.toString(),
                    urgenza: urgenza.toString(),
                    richiedente: richiedente,
                    status: 0,
                    magazzino: magazzino.toString(),
                    stock: {},
                    movimenti: {
                        tipo: "ricevuta da " + magazzino.toString(),
                        data: moment().format("YYYYMMDD"),
                        ora: moment().format("HH:mm:ss"),
                        user: null
                    }
                };

                let insert = await Richieste.create(NewData);
                try {

                    
                    await axios.get(url);
                } catch (err) {
                    logger.error(JSON.stringify(err.message));
                }
                return res.json({
                    type: "success",
                    message: "Inserito nelle richieste del magazzino",
                    data: null
                });
            }
        })();
    } else {
        return res.json({
            type: "error",
            message: JSON.stringify("uno dei dati non corrisponde")
        });
    };
});







/**
 * 
 * @param {*} keys prende in ingresso le chiavi (nomi colonne tabella)
 * @param {*} dati prende in input un array di dati da parsare come se fosse una tablla strutturata
 * @returns restituisce un json parsato
 */
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




/**
 * permette di annullare una richiesta inviata x sbaglio o cmq errata.
 * non fa altro che ricevere l'id, e mettergli uno stato 4, 
 * infine inviare un init all programma che sincronizza i telefoni
 * 
 * 
 */
router.post("/abortrequest", async function (req, res) {
    if (req.body.id) {

        try {
            var richiesta = await Richieste.findOneAndUpdate({
                "_id": req.body.id.trim().toString()
            }, {
                $set: {
                    status: 4
                }
            });

            res.json("ok")
        } catch (error) {
            logger.error(JSON.stringify(error.message));
            return res.json(null);
        }

        
        await axios.get(url);



    } else {
        logger.verbose("errore id")

        return res.json(null);
    }
});



router.get("/elencorichieste", async function (req, res) {

    let oggi = moment().format("YYYYMMDD")
    let user = req.query.utente || null;
    if (user) {
        try {
            var dati = await Richieste.find({
                data: oggi,
                $or: [{
                    'status': 0
                }, {
                    'status': 1
                }, ],
                "richiedente.username": user.toString()
            }).lean();
        } catch (err) {
            logger.error(err);
            var dati = [];
        }

        return res.json(dati);
    } else {
        try {
            let dati = await Richieste.find({
                data: oggi,
            }).lean();
            return res.json(dati);
        } catch (err) {
            logger.error(JSON.stringify(err.message));
            let dati = [];
            return res.json(dati);
        }

    };
});
/**
 * 
 * ritrona solo le richieste in stato aperto 0 e 1 per un determinato utente.
 */
router.get("/elencorichiesteattive", async function (req, res) {
    var oggi = moment().format("YYYYMMDD")
    var user = req.query.utente || null;
    if (user) {
        try {
            let dati = await Richieste.find({
                data: oggi,
                "richiedente.username": user.toString(),
                $or: [{
                    'status': 0
                }, {
                    'status': 1
                }]
            }).lean();
            return res.json(dati);
        } catch (err) {
            logger.error(err.message);
            var dati = [];
            return res.json(dati);
        }
    } else {
        try {
            let dati = await Richieste.find({
                data: oggi,
            }).lean();
            return res.json(dati);
        } catch (err) {
            logger.error(err);
            let dati = [];
            return res.json(dati);
        }
    };
});


router.get("/analisi", async function (req, res) {
    let datainizio = req.query.datainizio.toString() || moment().format("YYYYMMDD")
    let datafine = req.query.datafine.toString() || moment().format("YYYYMMDD")
    let user = req.query.utente.toString() || null;

    if (user) {
        try {
            const dati = await Richieste.find({
                "data": {
                    $gte: datainizio,
                    $lte: datafine
                },
                "richiedente.username": user
            }).lean();
            return res.json(dati);
        } catch (err) {
            logger.error(err);
            const dati = [];
            return res.json(dati);
        }
    } else {
        try {
            const dati = await Richieste.find({
                "data": {
                    $gte: datainizio.toString(),
                    $lte: datafine.toString()
                }
            }).lean();
            return res.json(dati);
        } catch (err) {
            logger.error(err);
            const dati = [];
            return res.json(dati);
        }

    }
});




router.post("/magmatreq", async function (req, res) {
    var codice = req.body.codice || null;
    var description = req.body.description || null;
    var qta = req.body.qta || null;
    var urgenza = req.body.urgenza || null;
    var richiedente = req.body.richiedente || null;
    var magazzino = req.body.magazzino || null;
    var tempo = req.body.tempo || null;
    var note = req.body.note || null;
    if (tempo == null) {
        tempo = moment().toISOString();
    }

    console.log(req.body)

    //todo SCEGLIERE MAGAZZINO IN BASE AL MATERIALE....... IO DIREI 1 STOCKAGGIO 2 FABBRIZZIO 3 TUTTI....?
    if (codice && description && qta && richiedente && tempo) {

        if (urgenza == null) {
            urgenza = 0;
        }
        var utente = await USER.findOne({
            username: richiedente.toString()
        }).lean();

        if (utente) {
            utente.codicereparto = {};
            utente.linea = {};
            utente.codicereparto.nomereparto = richiedente;
            utente.linea.nomelinea = richiedente;
        } else {
            return res.json({
                type: "error",
                message: "utente non trovato"
            });
        }


        codice = codice.toUpperCase().trim();
        var date = moment(tempo);
        var data = date.format('YYYYMMDD');
        var ora = date.tz('Europe/Rome').format('HH:mm:ss');
        // var ubicazioni = await UBICAZIONE.find({
        //     "articolo": codice
        // }).lean();


        const pool = new noderfc.Pool({
            connectionParameters: {
                dest: "MME"
            },
            poolOptions: {
                low: 2,
                high: 4
            }, // optional
        });


        if (typeof magazzino == "undefined" || magazzino == null) {
            if (utente.magazzino == "MOTORI") {
                magazzino = "STOCKAGGIO";
            } else if (utente.magazzino == "STOCKAGGIO") {
                magazzino = "MOTORI";
            } else {
                magazzino = "ALL";
            }
        }







        (async () => {
            try {
                const client = await pool.acquire();
                const abap_structure = {
                    RFCINT4: 345,
                    RFCFLOAT: 1.23456789,
                    RFCCHAR4: "ABCD",
                    RFCDATE: "20180625", // ABAP date format
                };
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
                        }, {
                            FIELDNAME: "LGORT", // magazzino 1010
                        }, {
                            FIELDNAME: "LABST", // IN STOCK
                        }, {
                            FIELDNAME: "INSME", // IN CQ
                        }, ],
                        DELIMITER: "|",
                        OPTIONS: [{
                            "TEXT": "MATNR = '" + codice + "' AND LGORT = '1010'"
                        }]
                    },
                    async function (err, dati) {
                        if (err) {
                            logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify(err)));
                            pool.release(client)
                            var NewData = {
                                data: data,
                                ora: ora,
                                codice: codice,
                                description: unescape(description),
                                qta: qta,
                                note: note,
                                urgenza: urgenza,
                                richiedente: richiedente,
                                status: 0,
                                magazzino: magazzino,
                                stock: {},
                                movimenti: {
                                    tipo: "ricevuta da " + magazzino,
                                    data: moment().format("YYYYMMDD"),
                                    ora: moment().format("HH:mm:ss"),
                                    user: null
                                }
                            };


                            let insert = await Richieste.create(NewData);
                            try {

                                
                                await axios.get(url);
                            } catch (err) {
                                logger.error(JSON.stringify(err.message));
                            }
                            return res.json({
                                type: "success",
                                message: "Inserito nelle richieste del magazzino",
                                data: insert
                            });

                        } else {
                            if (dati) {
                                if (Object.prototype.hasOwnProperty.call(dati, "DATA")) {
                                    logger.info(JSON.stringify("::ffff:" + myip + " , " + "Sono stati recuperati " + dati.DATA.length + " dati"));
                                    var parsato = rfc_parser(keys, dati);
                                    pool.release(client)
                                    if (parsato.length > 0) {
                                        var NewData = {
                                            data: data,
                                            ora: ora,
                                            codice: codice,
                                            description: description,
                                            qta: qta,
                                            note: note,
                                            urgenza: urgenza,
                                            richiedente: utente,
                                            status: 0,
                                            magazzino: magazzino,
                                            stock: parsato[0],
                                            movimenti: {
                                                tipo: "ricevuta da " + magazzino,
                                                data: moment().format("YYYYMMDD"),
                                                ora: moment().format("HH:mm:ss"),
                                                user: null
                                            }
                                        };
                                    } else {
                                        var NewData = {
                                            data: data,
                                            ora: ora,
                                            codice: codice,
                                            description: description,
                                            qta: qta,
                                            note: note,
                                            urgenza: urgenza,
                                            richiedente: utente,
                                            status: 0,
                                            magazzino: magazzino,
                                            stock: {},
                                            movimenti: {
                                                tipo: "ricevuta da " + magazzino,
                                                data: moment().format("YYYYMMDD"),
                                                ora: moment().format("HH:mm:ss"),
                                                user: null
                                            }
                                        };
                                    }
                                    let insert = await Richieste.create(NewData);
                                    try {

                                        
                                        await axios.get(url);
                                    } catch (err) {
                                        logger.error(JSON.stringify(err.message));
                                    }
                                    return res.json({
                                        type: "success",
                                        message: "Inserito nelle richieste del magazzino",
                                        data: insert
                                    });


                                } else {
                                    logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify("Manca la chiave 'DATA' nella risposta di sap")));
                                    pool.release(client)
                                    var NewData = {
                                        data: data,
                                        ora: ora,
                                        codice: codice,
                                        description: description,
                                        qta: qta,
                                        note: note,
                                        urgenza: urgenza,
                                        richiedente: utente,
                                        status: 0,
                                        magazzino: magazzino,
                                        stock: {},
                                        movimenti: {
                                            tipo: "ricevuta da " + magazzino,
                                            data: moment().format("YYYYMMDD"),
                                            ora: moment().format("HH:mm:ss"),
                                            user: null
                                        }
                                    };
                                    let insert = await Richieste.create(NewData);
                                    try {
                                                            

                                        await axios.get(url);
                                    } catch (err) {
                                        logger.error(JSON.stringify(err.message));
                                    }
                                    return res.json({
                                        type: "success",
                                        message: "Inserito nelle richieste del magazzino",
                                        data: insert
                                    });
                                }
                            }
                        }
                    });
            } catch (err) {
                logger.error(JSON.stringify("::ffff:" + myip + " , " + JSON.stringify(err)));
                //  pool.release(client)
                var NewData = {
                    data: moment(data, "YYYYMMDD").format("DD/MM/YYYY"),
                    ora: ora.toString(),
                    codice: codice.toString(),
                    description: description.toString(),
                    qta: qta.toString(),
                    note: note.toString(),
                    urgenza: urgenza.toString(),
                    richiedente: utente,
                    status: 0,
                    magazzino: magazzino.toString(),
                    stock: {},
                    movimenti: {
                        tipo: "ricevuta da " + magazzino.toString(),
                        data: moment().format("YYYYMMDD"),
                        ora: moment().format("HH:mm:ss"),
                        user: null
                    }
                };

                let insert = await Richieste.create(NewData);
                try {

                    await axios.get(url);
                } catch (err) {
                    logger.error(JSON.stringify(err.message));
                }
                return res.json({
                    type: "success",
                    message: "Inserito nelle richieste del magazzino",
                    data: insert
                });
            }
        })();
    } else {
        return res.json({
            type: "error",
            message: JSON.stringify("uno dei dati non corrisponde")
        });
    }
});