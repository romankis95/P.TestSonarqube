const express = require("express")
const router = express.Router()
const MAGAZZINI = require("../models/magazzino/magazzino")
const middleware = require("../middleware")
const USERS = require("../models/user")
const logger = require("./extensions/logger")
const sendmail = require("./extensions/nodemailer")
const moment = require("moment")


router.get("/", async function (req, res) {
    try {
        const magazzini = await MAGAZZINI.find().lean();
        const users = await USERS.find().lean();
        return res.render("users/users", {
            err: false,
            users: users,
            magazzini: magazzini
        });
    } catch (error) {
        req.flash("error", "Si è verificato un errore, avviso chi di compentenza!");
        logger.error(JSON.stringify(error.message));
        return res.render("users", {
            err: true,
            users: [],
            magazzini: []
        });
    }
});


router.get("/warehouses", async function (req, res) {
    try {
        const magazzini = await MAGAZZINI.find({}).lean();
        const users = await USERS.find().lean();
        return res.render("users/warehouses", {
            err: false,
            users: users,
            magazzini: magazzini
        });
    } catch (error) {
        req.flash("error", "Si è verificato un errore, avviso chi di compentenza!");
        logger.error(JSON.stringify(error.message));
        return res.render("users", {
            err: true,
            users: [],
            magazzini: []
        });
    }
});


router.post("/addwarehouse", async function (req, res) {
    var nome = req.body.mdlwarehouseusername || null;
    if (nome) {
        nome = nome.toUpperCase();
        nome = nome.replace(/[^a-z0-9]+|\s+/gmi, "");
        nome = nome.toString()
        if (nome.length > 3) {
            try {
                await MAGAZZINI.create({
                    nome: nome,
                    data: moment().format("YYYYMMDDHHmmss")
                });
            } catch (error) {
                if (error.code == 11000) {
                    req.flash('warning', 'Questo magazzino esiste già');
                } else {
                    req.flash('error', 'Si è verificato un errore, Roman è stato avvisato');
                    logger.error(JSON.stringify(error.message));
                    sendmail("Inserimento nuovo magazzino", JSON.stringify(error.message));
                }
            }
        } else {
            req.flash("warning", "il nome non è abbastanza lungo");
        }
    } else {
        req.flash("warning", "nessun nome inserito per il magazzino");
    };
    return res.redirect("back");
});



router.get("/removewarehouse/:id", async function (req, res) {
    try {
        var id = req.params.id || null;
        if (id) {
            const warehouse = await MAGAZZINI.findById(id).lean();
            if (warehouse) {
                await MAGAZZINI.findByIdAndDelete(id);
                req.flash("success", "Il magazzino è stato eliminato!");
            } else {
                req.flash("warning", "Magazzino non trovato");
            }
        } else {
            req.flash("warning", "Dati non validi");
        };
    } catch (err) {
        req.flash("error", "Si è verificato un errore!");
        logger.error(JSON.stringify(err.message));
    }
    return res.redirect("back");
});


router.post("/adduser",  async function (req, res) {
    try {

        let username = req.body.mdlusername || null;
        let magazzino = req.body.select || null;
        let nomereale = req.body.mdlnomereale || null;
        let isAdmin = req.body.mdlisadmin || null;
        let warehouse = await MAGAZZINI.findOne({
            nome: magazzino.toString()
        }).lean();
        if(!warehouse){
            req.flash("warning", "Il magazzino non esiste");
            return res.redirect("back");
        }
        if (username && magazzino && nomereale) {
            username = username.toUpperCase().trim();
            var password = username;
            if (isAdmin == true || isAdmin == "true") {
                isAdmin = true;
            } else {
                isAdmin = false;
            }
            USERS.register(new USERS({
                'username': username,
                'password': password,
                'magazzino': magazzino,
                'isAdmin': isAdmin,
                'nomereale': nomereale,
                'isMagazziniere': true,
                "codicereparto": {
                    "id": warehouse._id,
                    "nomereparto": magazzino
                },
                "linea": {
                    "id": warehouse._id,
                    "nomelinea": magazzino
                },
            }), password, function (err, user) {
                if (err) {
                    logger.error(JSON.stringify(err.message));
                    req.flash("error", "si è verificato un errore!")
                    return res.redirect("/users");
                } else {
                    if (user) {
                        req.flash("success", "L'utente è stato registrato!");
                        return res.redirect("back");
                    } else {
                        req.flash("error", "si è verificato un errore!")
                        return res.redirect("/users");
                    }
                }
            })

        } else {
            req.flash("warning", "I dati inseriti non sono validi!");
            return res.redirect("back");
        }
    } catch (error) {
        req.flash("error", "si è verificato un errore!")

        logger.error(JSON.stringify(error.message));
        return res.redirect("back");
    }
});

/**
 * enable user by id
 */
router.get("/enable/:id/",  async function (req, res) {
    var id = req.params.id || null;
    if (id) {
        try {
            await USERS.findByIdAndUpdate(id, {
                $set: {
                    status: true
                }
            });
        } catch (error) {
            logger.error(JSON.stringify(error.message));
            req.flash("error", "Si è verificato un errore, avviso chi di compentenza!");
        }
        req.flash("success", "Account ripristinato!")
    } else {
        req.flash("warning", "Non è stato possibile completare l'operaizone");
    };
    return res.redirect("/users/");
});


router.get("/disable/:id/",  async function (req, res) {
    var id = req.params.id || null;
    if (id) {
        try {
            await USERS.findByIdAndUpdate(id, {
                $set: {
                    status: false
                }
            });
        } catch (error) {
            logger.error(JSON.stringify(error.message));
            req.flash("error", "Si è verificato un errore, avviso chi di compentenza!");
        }
        req.flash("success", "Account disabilitato!")
    } else {
        req.flash("warning", "Non è stato possibile completare l'operaizone");
    };
    return res.redirect("/users/");
});



router.get("/queryuser/:id/", async function (req, res) {
    try {
        const user = await USERS.findById(req.params.id).lean();
        if (user) {
            return res.json(user);
        } else {
            return res.json(null);
        }
    } catch (error) {
        return res.json(null);
    }
});


router.post("/updateuser/:id",  async function (req, res) {
    try {
        var user = await USERS.findById(req.params.id).lean();
        if (user) {


            if (req.body.mdlupdateisadmin == "false") {
                req.body.mdlupdateisadmin = false;
            } else {
                req.body.mdlupdateisadmin = true;
            }
            await USERS.findByIdAndUpdate(req.params.id, {
                $set: {
                    "nomereale": req.body.mdlupdatenomereale,
                    "magazzino": req.body.updateselect,
                    "isAdmin": req.body.mdlupdateisadmin
                }
            })
            return res.redirect("back");
        } else {
            return res.redirect("back");
        }
    } catch (error) {
        return res.redirect("back");
    }
});


router.post("/deleteuser/:id",  async function (req, res) {
    try {
        const user = await USERS.findById(req.params.id).lean();
        if (user) {
            await USERS.findByIdAndDelete(req.params.id);
            req.flash("success", "L'utente è stato eliminato!");
            return res.redirect("back");
        } else {
            req.flash("warning", "Utente non trovato!");
            return res.redirect("back");
        }
    } catch (error) {
        req.flash("error", "Si è verificato un errore!");
        logger.error(JSON.stringify(error.message));
        return res.redirect("back");
    }
});


router.post("/updateuserpassword/:id",   async function (req, res) {
    try {
        var user = await USERS.findById(req.params.id)
        if (user) {
            req.body.mdlpassword = req.body.mdlpassword.toUpperCase();
            user.setPassword(req.body.mdlpassword, function (err, user) {
                if (err) {
                    logger.error(JSON.stringify(err.message));
                    req.flash("error", "si è verificato un errore!")
                    return res.redirect("back");
                } else {
                    if (user) {
                        user.save();
                        req.flash("success", "La password è stata aggiornata!");
                        return res.redirect("back");
                    } else {
                        req.flash("error", "si è verificato un errore!")
                        return res.redirect("back");
                    }
                }
            })
        } else {
            req.flash("warning", "Utente non trovato!");
            return res.redirect("back");
        }
    } catch (error) {
        req.flash("error", "si è verificato un errore!")
        logger.error(JSON.stringify(error.message));
        return res.redirect("back");
    }
});

module.exports = router;