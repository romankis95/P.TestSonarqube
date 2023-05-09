/**librerie */
const express = require("express");
const router = express.Router();
const passport = require("passport");
const ip = require('ip');
const myip = ip.address();
const moment = require("moment");
const jwt = require('jwt-simple');
const logger = require("../../../extensions/logger");
const User = require("./../../../../models/user");
const Richieste = require("./../../../../models/richieste")
const Ubicazioni = require("./../../../../models/ubicazione")
module.exports = router;





/**
 * permette il login 
 * 
 */
router.post("/signin", async (req, res, next) => {

    req.body.username = req.body.username.toUpperCase().trim();
        req.body.password = req.body.password.toUpperCase().trim();

    passport.authenticate('local', {
        failureFlash: true
    }, function (err, user, info) {
        if (err) {
            logger.error(JSON.stringify("::ffff:" + myip + " , " + "Errore login:" + err.message));
            return res.json({
                err: "errore",
                token: null,
                user: null
            });
        };
        if (!user) {
            logger.error(JSON.stringify("::ffff:" + myip + " , " + "Utente non trovato:" + req.body.username));
            req.flash("error", "Nome Utente o Password Errata");
            return res.json({
                err: "errore",
                token: null,
                user: null
            });
        };
        if (info) {
            logger.info("::ffff:" + myip + +" , " + JSON.stringify((info)));
        };
        req.logIn(user, function (err) {
            if (err) {
                logger.error(JSON.stringify("::ffff:" + myip + " , " + "Tentativo di login" + err.message));
                req.flash("error", "Nome Utente o Password Errata");
                return res.json({
                    err: "errore",
                    token: null,
                    user: null
                });
            };

            logger.info(JSON.stringify("::ffff:" + myip + " , " + "Login da " + "utente:" + req.body.username));
            var utente = {
                username: user.username,
                _id: user._id,
                nomereale: user.nomereale,
                isAdmin: user.isAdmin,
                isMagazziniere: user.isMagazziniere,
                exp: moment().add(12, 'hours').toISOString()
            }
            var altreinfo = {
                username: user.username,
                _id: user._id,
                nomereale: user.nomereale,
                isAdmin: user.isAdmin,
                isMagazziniere: user.isMagazziniere,
                exp: moment().add(12, 'hours').toISOString(),
                magazzino: user.magazzino
            };
            var token = jwt.encode(utente, process.env.SECRET);

            return res.json({
                err: null,
                user: altreinfo,
                token: token
            });
        });
    })(req, res, next);
});


/**
 * permette il log out
 * 
 * 
 */
router.post("/singout", async function (req, res) {
    //todo il logout non serve anche perché ho deciso che metterò in dart una funzione che svuoti lo _storage ogni giorno alle xx:xx, metterei una api call qui per avere un ora di log inizio una di log fine
});



router.post("/changereparto", async function (req, res) {
    try {
        var query = req.query;

        var magazzino = query['magazzino'] || null;
        var username = query['utente'] || null;

        var user = await User.findOne({
            'username': username.toString()
        }).lean();

        if (user) {
            var userupdate = await User.findByIdAndUpdate(user._id, {
                $set: {
                    'magazzino': magazzino,
                    'linea.nomelinea': magazzino,
                    'codicereparto.nomereparto': magazzino
                }
            }, {
                new: true
            });

            return res.json({
                type: "success",
                message: JSON.stringify("Reparto aggiornato!")
            });
        } else {
            return res.json({
                type: "warning",
                message: JSON.stringify("Utente non trovato\!")
            });
        }
    } catch (error) {
        return res.json({
            type: "error",
            message: JSON.stringify(error.message)
        });
    }
});

router.get("/userstats", async function (req, res) {
    var username = req.query.username || null;
    var questanno = moment().startOf('year').format('YYYYMMDD');

    if (username) {
        username = username.trim();
        try {
            var numeroRichieste = await Richieste.countDocuments({
                'status': 2,
                'rispondente.username': username.toString()
            });
            var numeroUbicazioni = await Ubicazioni.countDocuments({
                'ubicatore.username': username.toString()
            });
            return res.json({
                richieste: numeroRichieste,
                ubicazioni: numeroUbicazioni
            });
        } catch (error) {
            return res.json(null);
        }
    } else {
        return res.json(null);
    }
});