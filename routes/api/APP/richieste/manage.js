/**librerie */
const express = require("express");
const router = express.Router();
const moment = require("moment-timezone");
const axios = require("axios");
const ejs = require("ejs");
/**Database */
const UBICAZIONE = require("./../../../../models/ubicazione");
const USER = require("./../../../../models/user");
const RICHIESTE = require("./../../../../models/richieste");
const Mail = require("../../../../models/mail");
const url = "http://" + process.env.SERVER + ":" + process.env.SERVER + "/update/"
/**extensions+middleware */
const logger = require("./../../../extensions/logger");

//todo mettere le varie richieste in un trycatch
module.exports = router;

/**
 * permette di prendere in carico una richiesta così non la fa nessun altro 
 * 
 * 
 * STATUS 0 => 1
 */
router.get("/prendoincarico/:id/", async function (req, res) {
    const utente = await USER.findById(req.query.userid, {
            "_id": 1,
            "username": 1,
            "magazzino": 1
        });
        const rich = await RICHIESTE.findById(req.params.id).exec();

        

    if (rich && utente) {
        if (rich.status == 0 || rich.status == "0") {
            const dt = moment().tz('Europe/Rome').format("YYYYMMDD");
            const or = moment().tz('Europe/Rome').format("HH:mm:ss");
            const movimento = {
                'tipo': "accettata",
                'data': dt,
                'ora': or,
                'user': utente,
            }
            let newUpdate = {
                $push: {
                    'movimenti': movimento
                },
                $set: {
                    'data_accettazione': dt,
                    'ora_accettazione': or,
                    'rispondente': {
                        'username': utente.username,
                        '_id': utente._id
                    },
                    'status': 1,
                }
            };
            try {
               await RICHIESTE.findByIdAndUpdate(req.params.id, newUpdate).exec();
            } catch (error) {
                logger.error(JSON.stringify(error.message));
                return res.json({
                    'type': "error",
                    'data': null,
                    'message': "Errore di sistema!"
                });
            }
            try {
              await axios.get(url);
                logger.info("Tutto ok, operazione eseguita!");
            } catch (error) {
                logger.error(JSON.stringify(error.message));
            }
            return res.json({
                'type': "success",
                'status': "success",

                'data': richiesta,
                'message': "Tutto ok, operazione eseguita!"
            });
        } else {
            logger.warn("Richiesta in uno stato diverso da \"libero\". Aggiorna la pagina");
            return res.json({
                'type': "warning",
                'data': null,
                'message': "Richiesta in uno stato diverso da \"libero\". Aggiorna la pagina"
            });
        };
    } else {
        logger.warn("Utente o richiesta non trovati");
        return res.json({
            'type': "warning",
            'data': null,
            'message': "Utente o richiesta non trovati"
        });
    };
});

/**
 * contrassegna la richiesta nell'app come terminata
 * 
 * STATUS 1 => 2
 */
router.get("/termino/:id/", async function (req, res) {

        const utente = await USER.findById(req.query.userid, {
            "_id": 1,
            "username": 1,
            "magazzino": 1
        }).exec();
        const rich = await RICHIESTE.findById(req.params.id).exec();


    if (rich && utente) {
        if ((rich.status == "1" || rich.status == 1) && rich.rispondente.username == utente.username) {
            const dt = moment().tz('Europe/Rome').format("YYYYMMDD");
            const or = moment().tz('Europe/Rome').format("HH:mm:ss");
            const movimento = {
                'tipo': "completata",
                'data': dt,
                'ora': or,
                'user': utente,
            };
            let newUpdate = {
                $push: {
                    'movimenti': movimento
                },
                $set: {
                    'data_conclusione': dt,
                    'ora_conclusione': or,
                    'rispondente': {
                        'username': utente.username,
                        '_id': utente._id
                    },
                    'status': 2,
                }
            };
            try {
                await RICHIESTE.findByIdAndUpdate(req.params.id, newUpdate).exec();
                try {
                  await axios.get(url);
                    logger.info("Tutto ok, operazione eseguita!");
                } catch (error) {
                    logger.error(JSON.stringify(error.message));
                }
                logger.info("Richiesta conclusa con successo!");
                return res.json({
                    'type': "success",
                    'status': "success",
                    'data': richiesta,
                    'message': "Richiesta conclusa con successo!"
                });
            } catch (error) {
                logger.error(JSON.stringify(error.message));
                return res.json({
                    'type': "error",
                    'data': null,
                    'message': "Errore di sistema!"
                });
            }
        } else {
            logger.warn("Richiesta in uno stato diverso \"in lavorazione\". Aggiorna la pagina");
            return res.json({
                'type': "warning",
                'status': "warning",
                'data': null,
                'message': "Richiesta in uno stato diverso \"in lavorazione\". Aggiorna la pagina"
            });
        };
    } else {
        logger.warn("Non trovo la richiesta nel sistema");
        return res.json({
            'type': "error",
            'status': "error",
            'data': null,
            'message': "Non trovo la richiesta nel sistema"
        });
    }
});

/**
 * se ho preso in carico una richiesta che non posso portare a termine
 * posso liberarla in modo che la prenda in carico qualcun altro
 * 
 * STATUS 1 => 0
 */
router.get("/rilascio/:id/", async function (req, res) {
    try {
        var utente = await USER.findById(req.query.userid, {
            "_id": 1,
            "username": 1,
            "magazzino": 1
        });
        var rich = await RICHIESTE.findById(req.params.id);

    } catch (error) {
        logger.error(JSON.stringify(error.message));
        return res.json({
            'type': "error",
            'data': null,
            'message': "Errore di sistema!"
        });
    }
    if (rich && utente) {
        if ((rich.status == "1" || rich.status == 1) && (rich.rispondente.username == utente.username)) {
            var dt = moment().tz('Europe/Rome').format("YYYYMMDD");
            var or = moment().tz('Europe/Rome').format("HH:mm:ss");
            var movimento = {
                'tipo': "liberata",
                'data': dt,
                'ora': or,
                'user': utente,
            }
            let newUpdate = {
                $push: {
                    'movimenti': movimento
                },
                $set: {
                    'data_conclusione': "",
                    'data_accettazione': "",
                    'ora_conclusione': "",
                    'ora_accettazione': "",
                    'rispondente': null,
                    'status': 0,
                }
            };
            try {
                var richiesta = await RICHIESTE.findByIdAndUpdate(req.params.id, newUpdate);
                try {
                  await axios.get(url);
                    logger.info("Tutto ok, operazione eseguita!");
                } catch (error) {
                    logger.error(JSON.stringify(error.message));
                }
                return res.json({
                    'status': "success",
                    'type': "success",
                    'data': richiesta,
                    'message': "risposta dal programma nodejs"
                });
            } catch (error) {
                logger.error(JSON.stringify(error.message));
                return res.json({
                    'type': "error",
                    'data': null,
                    'message': "Errore di sistema!"
                });
            }
        } else {
            return res.json({
                'type': "warning",
                'status': "warning",

                'data': null,
                'message': "Richiesta in uno stato diverso da \"In Lavorazione\" o Affidata ad un\'altro utente"
            });
        }
    } else {
        return res.json({
            'type': "error",
            'status': "error",

            'data': null,
            'message': "Non trovo la richiesta nel sistema"
        });
    }
});



/**
 * permette di cancellare una richiesta dall'app
 * magari perché non soddisfacibile o altri motivi
 * 
 * STATUS 0 => 3
 */
router.get("/elimino/:id/", async function (req, res) {
    try {
        var utente = await USER.findById(req.query.userid, {
            "_id": 1,
            "username": 1,
            "magazzino": 1
        });
        var rich = await RICHIESTE.findById(req.params.id);

    } catch (error) {
        logger.error(JSON.stringify(error.message));
        return res.json({
            'type': "error",
            'data': null,
            'message': "Errore di sistema!"
        });
    }
    if (utente && rich) {
        if (rich.status == "0" || rich.status == 0) {
            if (rich.magazzino == utente.magazzino || rich.magazzino == "ALL") {
                const dt = moment().tz('Europe/Rome').format("YYYYMMDD");
                const or = moment().tz('Europe/Rome').format("HH:mm:ss");
                const movimento = {
                    'tipo': "eliminata",
                    'data': dt,
                    'ora': or,
                    'user': utente,
                }
                let newUpdate = {
                    $push: {
                        "movimenti": movimento
                    },
                    $set: {
                        "data_eliminazione": moment().tz('Europe/Rome').format("YYYYMMDD"),
                        "ora_eliminazione": moment().tz('Europe/Rome').format("HH:mm:ss"),
                        "rispondente": {
                            "username": utente.username,
                            "_id": utente._id
                        },
                        "status": 3
                    }
                };

                try {
                    var richiesta = await RICHIESTE.findByIdAndUpdate(req.params.id, newUpdate);
                    logger.info("Tutto ok, operazione eseguita!");

                    try {
                      await axios.get(url);
                    } catch (error) {
                        logger.error(JSON.stringify(error.message));
                    }
                    return res.json({
                        status: "success",
                        type: "success",
                        data: richiesta,
                        message: "risposta dal programma nodejs"
                    })
                } catch (error) {
                    logger.error(JSON.stringify(error.message));
                    return res.json({
                        type: "error",
                        data: null,
                        message: "Errore di sistema!"
                    });
                }
            } else {
                return res.json({
                    type: "warning",
                    data: null,
                    message: "La richiesta non è in stato \"libero\""
                });
            }
        } else {
            return res.json({
                type: "warning",
                data: null,
                message: "La richiesta non è in stato libero"
            });
        }
    } else {
        return res.json({
            type: "warning",
            data: null,
            message: "Utente o Richiesta non trovati!"
        });
    }
});

/**
 * permette di recuperare una richiesta cancellata dall'app.
 * e renderla di nuovo "da fare"
 * 
 */
router.get("/recupero/:id/", async function (req, res) {
    try {
        var utente = await USER.findById(req.query.userid, {
            "_id": 1,
            "username": 1,
            "magazzino": 1
        });
        var rich = await RICHIESTE.findById(req.params.id);
    } catch (error) {
        logger.error(JSON.stringify(error.message));
        return res.json({
            type: "error",
            data: null,
            message: "Errore di sistema!"
        });
    }
    if (utente && rich) {
        if ((rich.status == 3 || rich.status == "3") || (rich.status == 2 || rich.status == "2")) {
            if (utente.magazzino == rich.magazzino || rich.magazzino == "ALL") {
                var dt = moment().tz('Europe/Rome').format("YYYYMMDD");
                var or = moment().tz('Europe/Rome').format("HH:mm:ss");
                var movimento = {
                    tipo: "recuperata",
                    data: dt,
                    ora: or,
                    user: utente,
                };
                let newUpdate = {
                    $push: {
                        movimenti: movimento
                    },
                    $set: {
                        data_conclusione: "",
                        data_accettazione: "",
                        data_eliminazione: "",
                        ora_eliminazione: "",
                        ora_accettazione: "",
                        ora_conclusione: "",
                        rispondente: null,
                        status: 0
                    }
                };
                try {
                    var richiesta = await RICHIESTE.findByIdAndUpdate(req.params.id, newUpdate);
                    try {
                      await axios.get(url);
                        logger.info("Tutto ok, operazione eseguita!");
                    } catch (error) {
                        logger.error(JSON.stringify(error.message));
                    }
                    return res.json({
                        status: "success",
                        type: "success",
                        data: richiesta,
                        message: "Richiesta recuperata!"
                    });
                } catch (error) {
                    logger.error(JSON.stringify(error.message));
                    return res.json({
                        type: "error",
                        data: null,
                        message: "Errore di sistema!"
                    });
                }
            } else {
                return res.json({
                    status: "warning",
                    type: "warning",
                    data: null,
                    message: "La richiesta non fa parte del mio magazzino!"
                });
            }
        } else {
            return res.json({
                status: "warning",
                type: "warning",
                data: null,
                message: "La richiesta è in uno stato diverso da \"eseguto\" o \"cancellato\"."
            });
        }
    } else {
        return res.json({
            status: "warning",
            type: "warning",
            data: null,
            message: "Non trovo o la richiesta o l\'utente."
        });
    }
});


/**
 * permette di vedere lo storico delle richieste nell'app
 * riceve in input il magazzino dell'utente (motori, stockaggio, all, bracci)
 * e restituisce un json delle richieste del giorno precedente e quello attuale.
 * 
 */
router.get("/storico", async function (req, res) {
    const dataLimite = moment().subtract(1, "days").format("YYYYMMDD");
    const magazzino = req.query.magazzino || null;
    let query_ufficiale = {};
    if (magazzino && magazzino == "ALL") {
        query_ufficiale = {
            status: {
                $gte: 2
            },
            data: {
                $gte: dataLimite
            },
        };
    } else if (magazzino) {
        query_ufficiale = {
            status: {
                $gte: 2
            },
            data: {
                $gte: dataLimite
            },
            $or: [{
                    magazzino: req.query.magazzino.toString()
                },
                {
                    magazzino: "ALL"
                }
            ]
        };
    } else {
        return res.json({
            type: "error",
            message: "Non riesco a recuperare lo storico",
            risultati: []
        });
    }

    try {
        var richieste = await RICHIESTE.find(query_ufficiale).lean();
        richieste.sort(function (a, b) {
            return b.data - a.data;
        });
        for (const element of richieste) {
            const ubicazioni = await UBICAZIONE.find({
                "articolo": element.codice
            }).lean();
            element["ubicazioni"] = new Array();
            for (let j = 0; j < ubicazioni.length; j++) {
                element["ubicazioni"].push({
                    "magazzino": ubicazioni[j].magazzino,
                    "ubicazione": ubicazioni[j].ubicazione,
                    "datainserimento": ubicazioni[j].datainserimento
                });
            }
        }
        try {
          await axios.get(url);
            logger.info("Tutto ok, operazione eseguita!");
        } catch (error) {
            logger.error(JSON.stringify(error.message));
        }
        return res.json({
            type: "success",
            message: "Inserito nelle richieste del magazzino",
            risultati: richieste
        });
    } catch (error) {
        logger.error(JSON.stringify(error.message));
        return res.json({
            type: "error",
            message: "Non riesco a recuperare lo storico",
            risultati: []
        });
    }
});


/**
 * 
 * Quando il magazzino di riferimento è ALL
 * allora tu puoi dire, no è solo competenza dell'altro reparto
 * e quindi da ALL passa a MOTORI o STOCKAGGIO 
 * in base a chi la "regala"
 */

router.post("/regalarichiesta", async function (req, res) {
    const utente = req.query.utente || null;
    const id = req.query.id || null;
    logger.info("regalarichiesta", utente, id);
    if (utente && id) {
        var richiesta = await RICHIESTE.findById(id);
        if (richiesta) {
            if (richiesta.magazzino == "ALL") {
                try {
                    var user = await USER.findOne({
                        "username": utente.toString()
                    });
                } catch (error) {
                    logger.error(JSON.stringify(err.message));

                    return res.json({
                        type: "error",
                        message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
                        data: null
                    });
                }
                if (user) {

                    if (user.magazzino == "STOCKAGGIO") {
                        try {
                            const dt = moment().tz('Europe/Rome').format("YYYYMMDD");
                            const or = moment().tz('Europe/Rome').format("HH:mm:ss");
                            const movimento = {
                                tipo: "trasferita",
                                data: dt,
                                ora: or,
                                user: user,
                            }
                            const richiesta = await RICHIESTE.findByIdAndUpdate(id, {
                                $set: {
                                    magazzino: "MOTORI",
                                    status: 0,
                                    rispondente: null
                                },
                                $push: {
                                    movimenti: movimento
                                }
                            }).exec();
                            try {
                                
                              await axios.get(url);
                                logger.info("Tutto ok, operazione eseguita!");
                            } catch (error) {
                                logger.error(JSON.stringify(error.message));
                            }
                            return res.json({
                                type: "success",
                                message: "Tutto ok",
                                data: null
                            });
                        } catch (error) {
                            logger.error(JSON.stringify(err.message));

                            return res.json({
                                type: "error",
                                message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
                                data: null
                            });
                        }
                    } else if (user.magazzino == "MOTORI") {
                        try {
                            var dt = moment().tz('Europe/Rome').format("YYYYMMDD");
                            var or = moment().tz('Europe/Rome').format("HH:mm:ss");
                            var movimento = {
                                tipo: "trasferita",
                                data: dt,
                                ora: or,
                                user: user,
                            }
                            try {
                              await axios.get(url);
                                logger.info("Tutto ok, operazione eseguita!");
                            } catch (error) {
                                logger.error(JSON.stringify(error.message));
                            }
                            var richiesta = await RICHIESTE.findByIdAndUpdate(id, {
                                $set: {
                                    magazzino: "STOCKAGGIO",
                                    status: 0,
                                    rispondente: null
                                },
                                $push: {
                                    movimenti: movimento
                                }
                            }).exec();
                            return res.json({
                                type: "success",
                                message: "Tutto ok",
                                data: null
                            });
                        } catch (error) {
                            logger.error(JSON.stringify(err.message));

                            return res.json({
                                type: "error",
                                message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
                                data: null
                            });
                        }
                    } else {
                        return res.json({
                            type: "warning",
                            message: "Nulla da fare qui, non sei ne di STOCKAGGIO, ne di MOTORI",
                            data: null
                        });
                    };
                } else {
                    return res.json({
                        type: "warning",
                        message: "Utente non trovato, chiediamo aiuto a ROMAN.",
                        data: null
                    });
                }
            } else {
                return res.json({
                    type: "warning",
                    message: "Ho eseguito la funzione sbagliata, chiediamo aiuto a ROMAN.",
                    data: null
                });
            };
        } else {
            return res.json({
                type: "warning",
                message: "Nessuna richiesta trovata nel sistema",
                data: null
            });
        }
    } else {
        return res.json({
            type: "warning",
            message: "Dati errati",
            data: null
        });
    };
});

/**
 * Quano un magazzino motori ha una richiesta e la vuole dare a stockaggio.
 *  o viceversa
 * 
 */
router.post("/spostarichiesta", async function (req, res) {

    const utente = req.query.utente || null;
    const id = req.query.id || null;
    logger.info("spostarichiesta", utente, id);
    if (utente && id) {
        var richiesta = await RICHIESTE.findById(id);
        if (richiesta) {
            try {
                var user = await USER.findOne({
                    "username": utente.toString()
                });
            } catch (error) {
                logger.error(JSON.stringify(err.message));

                return res.json({
                    type: "error",
                    message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
                    data: null
                });
            }
            if (user) {

                if (user.magazzino == "STOCKAGGIO" && (richiesta.magazzino == "STOCKAGGIO" || richiesta.magazzino == "ALL")) {
                    try {
                        const dt = moment().tz('Europe/Rome').format("YYYYMMDD");
                        const or = moment().tz('Europe/Rome').format("HH:mm:ss");
                        const movimento = {
                            tipo: "trasferita",
                            data: dt,
                            ora: or,
                            user: user,
                        }
                        var richiesta = await RICHIESTE.findByIdAndUpdate(id, {
                            $set: {
                                magazzino: "MOTORI",
                                status: 0,
                                rispondente: null
                            },
                            $push: {
                                movimenti: movimento
                            }
                        }).exec();
                        try {
                          await axios.get(url);
                            logger.info("Tutto ok, operazione eseguita!");
                        } catch (error) {
                            logger.error(JSON.stringify(error.message));
                        }
                        return res.json({
                            type: "success",
                            message: "Tutto ok",
                            data: null
                        });
                    } catch (error) {
                        logger.error(JSON.stringify(error.message));

                        return res.json({
                            type: "error",
                            message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
                            data: null
                        });
                    }
                } else if (user.magazzino == "MOTORI" && (richiesta.magazzino == "MOTORI" || richiesta.magazzino == "ALL")) {
                    try {
                        let dt = moment().tz('Europe/Rome').format("YYYYMMDD");
                        let or = moment().tz('Europe/Rome').format("HH:mm:ss");
                        let movimento = {
                            tipo: "trasferita",
                            data: dt,
                            ora: or,
                            user: user,
                        }
                        await RICHIESTE.findByIdAndUpdate(id, {
                            $set: {
                                magazzino: "STOCKAGGIO",
                                status: 0,
                                rispondente: null
                            },
                            $push: {
                                movimenti: movimento
                            }
                        }).exec();
                        try {
                            let testx = await axios.get(url);
                            logger.info("Tutto ok, operazione eseguita!");
                        } catch (error) {
                            logger.error(JSON.stringify(error.message));
                        }
                        return res.json({
                            type: "success",
                            message: "Tutto ok",
                            data: null
                        });
                    } catch (error) {
                        logger.error(JSON.stringify(err.message));

                        return res.json({
                            type: "error",
                            message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
                            data: null
                        });
                    }
                } else {
                    return res.json({
                        type: "warning",
                        message: "Nulla da fare qui, non sei ne di STOCKAGGIO, ne di MOTORI",
                        data: null
                    });
                };
            } else {
                return res.json({
                    type: "warning",
                    message: "Utente non trovato, chiediamo aiuto a ROMAN.",
                    data: null
                });
            };
        } else {
            return res.json({
                type: "warning",
                message: "Nessuna richiesta trovata nel sistema",
                data: null
            });
        }
    } else {
        return res.json({
            type: "warning",
            message: "Dati errati",
            data: null
        });
    }
});



router.post("/sendalertcq/", async function (req, res) {
    try {
        let destinatari = "";

        let contatti = await Mail.find({
            type: "cq"
        }).lean();
        if(contatti.length == 0){
             return res.json({
                 type: "warning",
                 message: "Nessun contatto trovato",
                 data: null
             });
        }
        contatti.forEach(function (item) {
            destinatari += item.mail + ",";
        });

        

        const nodemailer = require("nodemailer");
        const utente = req.query.utente || null;
        var utenteDb = await USER.findOne({
            "username": utente.toString()
        }).lean();
        const id = req.query.id || null;
        if (utenteDb && id) {
            var richiesta = await RICHIESTE.findById(id).lean();
            if (richiesta != null) {



                try {
                    ejs.renderFile(__dirname + "/../../../../views/mail.ejs", {
                        codice: richiesta.codice,
                        descrizione: richiesta.description,
                        nomecognome: utenteDb.nomereale,
                        currentUser: utenteDb,
                        richiedente: richiesta.richiedente
                    }, function (err, data) {
                        if (err) {
                            logger.error(JSON.stringify(err.message));
                        } else {
                            var transporter = nodemailer.createTransport({
                                service: 'Gmail',
                                auth: {
                                    user: 'roman.kiss.appunti@gmail.com',
                                    pass: 'fftxkwphyapianga'
                                }
                            });

                            transporter.sendMail({
                                from: '"WannaBe Magazzino" gestionale2@italtergi.com',
                                to: destinatari,
                                subject: "Sblocco codice per Produzione",
                                html: data,
                            })

                        }
                    });
                } catch (error) {
                    logger.error(JSON.stringify(error.message));
                    return res.json({
                        type: "warning",
                        message: "Dati errati",
                        data: null
                    });
                }

                return res.json({
                    type: "success",
                    message: "Main a Cq inviata!",
                    data: richiesta
                });
            } else {
                return res.json({
                    type: "warning",
                    message: "Dati errati, mail non inviata!",
                    data: null
                });
            };
        } else {
            return res.json({
                type: "warning",
                message: "Dati errati",
                data: null
            });
        }
    } catch (error) {
        logger.error(JSON.stringify(error.message));

        return res.json({
            type: "error",
            message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
            data: null
        });
    }
});


router.post("/sendalertacq/", async function (req, res) {
    try {
        let destinatari = "";

        let contatti = await Mail.find({
            type: "acquisti"
        }).lean();
        if (contatti.length == 0) {
            return res.json({
                type: "warning",
                message: "Nessun contatto trovato",
                data: null
            });
        }
        contatti.forEach(function (item) {
            destinatari += item.mail + ",";
        });
        const nodemailer = require("nodemailer");
        const utente = req.query.utente || null;
        var utenteDb = await USER.findOne({
            "username": utente.toString()
        }).lean();
        const codice = req.query.codice || null;
        if (utenteDb && codice) {

            try {
                ejs.renderFile(__dirname + "/../../../../views/mail_esaurito.ejs", {
                    codice: codice,
                    nomecognome: utenteDb.nomereale,

                }, function (err, data) {
                    if (err) {
                        logger.error(JSON.stringify(err.message));
                    } else {
                        var transporter = nodemailer.createTransport({
                            service: 'Gmail',
                            auth: {
                                user: 'roman.kiss.appunti@gmail.com',
                                pass: 'fftxkwphyapianga'
                            }
                        });
                        let info = transporter.sendMail({
                            from: '"WannaBe Magazzino" gestionale2@italtergi.com',
                            to: destinatari,
                            subject: "Sollecito Acquisto",
                            html: data,
                        })

                    }
                });
            } catch (error) {
                logger.error(JSON.stringify(error.message));
                return res.redirect("/contatti?sent=fail");
            }

            return res.json({
                type: "success",
                message: "Main a Cq inviata!",
                data: null
            });


        } else {
            return res.json({
                type: "warning",
                message: "Dati errati",
                data: null
            });
        }
    } catch (error) {
        logger.error(JSON.stringify(error.message));

        return res.json({
            type: "error",
            message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
            data: null
        });
    }
});





router.get("/mierichieste/", async function (req, res) {

    try {
        var username = req.query.username || null;
        if (username !== null) {
            var query = {};

            query['richiedente'] = {};
            query['richiedente']['username'] = username;
            query['status'] = {
                $lte: 1
            }
            var richieste = await RICHIESTE.find(query).lean();
            return res.json({
                type: "success",
                message: "Tutto ok",
                data: richieste
            });
        } else {
            return res.json({
                type: "warning",
                message: "Dati errati",
                data: null
            });
        }
    } catch (error) {
        logger.error(JSON.stringify(error.message));
        return res.json({
            type: "error",
            message: "Si è verificato un errore di sistema, Roman è già stato avvisato",
            data: null
        });
    }
});
