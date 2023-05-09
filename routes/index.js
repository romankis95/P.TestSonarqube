const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const middleware = require("../middleware");
const sendmail = require("../routes/extensions/nodemailer");
const logger = require("../routes/extensions/logger");
const ip = require('ip');
const myip = ip.address();

router.get("/mail", function(req, res){
        return res.render("mail")
});


router.get("/", middleware.isNotLoggedIn, function (req, res) {
    User.find({
        "isMagazziniere": "false"
    }, function (err, utentitrovati) {
        if (err) {
            logger.error("::ffff:" + myip + +" , " + JSON.stringify(("Errore login:" + err.message)));
            sendmail("Errore login", JSON.stringify(err));
            res.render("login", {
                utentitrovati: []
            });
        } else {
            res.render("login", {
                utentitrovati: utentitrovati
            });
        };
    });
});


router.get("/login", middleware.isNotLoggedIn, function (req, res) {
    User.find({
        "isMagazziniere": "false"
    }, function (err, utentitrovati) {
        if (err) {
            logger.error("::ffff:" + myip + +" , " + JSON.stringify(("Errore login:" + err.message)));
            sendmail("Errore login", JSON.stringify(err));
            res.render("login", {
                utentitrovati: null
            });
        } else {
            res.render("login", {
                utentitrovati: utentitrovati
            });
        };
    });
});




//funzione di log avanzata, da descrivere
router.post('/login', middleware.isNotLoggedIn, function (req, res, next) {
    passport.authenticate('local', {
        failureFlash: true
    }, function (err, user, info) {
        if (err) {
            logger.error(JSON.stringify("::ffff:" + myip + " , " + "Errore login:" + err.message));
            return res.redirect('/login');
        };
        if (!user) {
            logger.error(JSON.stringify("::ffff:" + myip + " , " + "Utente non trovato:" + req.body.username));
            req.flash("error", "Nome Utente o Password Errata");
            return res.redirect('/login');
        };
        if (info) {
            logger.info("::ffff:" + myip + +" , " + JSON.stringify((info)));
        };
        req.logIn(user, function (err) {
            if (err) {
                logger.error(JSON.stringify("::ffff:" + myip + " , " + "Tentativo di login" + err.message));
                req.flash("error", "Nome Utente o Password Errata");
                return res.redirect('/login');
            };
            logger.info(JSON.stringify("::ffff:" + myip + " , " + "Login da " + "utente: " + req.body.username));

            return res.redirect('/principale');

        });
    })(req, res, next);
});


// funzione di log out avanzata
router.get("/logout", middleware.isLoggedIn, function (req, res) {
    logger.info(JSON.stringify("::ffff:" + myip + " , " + "Logout da utente: " + req.user.username));
    req.logout();
    res.redirect("/login"); //redirect alla main una volta sloggato
});



module.exports = router;