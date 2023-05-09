const User = require("../models/user");


module.exports = {
    isLoggedIn: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash("Errore", "Deve essere registrato per farlo!");
        res.redirect("/login");
    },


    isAdmin: function (req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.isAdmin) {
                next();
            } else {
                req.flash("Errore", "Non ha il permesso per farlo!");
                res.redirect("/principale/" + req.params.id);
            }
        } else {
            req.flash("Errore", "Deve essere registrato per farlo!");
            res.redirect("login");
        }
    },

    isMagazziniere: function (req, res, next) {

        if (req.isAuthenticated()) {
            if (req.user.isMagazziniere) {
                next();
            } else {
                req.flash("Errore", "Non ha il permesso per farlo!");
                res.redirect("/principale/" + req.params.id);
            }
        } else {
            req.flash("Errore", "Deve essere registrato per farlo!");
            res.redirect("login");
        }
    },


    isSuperAdmin: function (req, res, next) {

        if (req.isAuthenticated()) {
            if (req.user.isSuperAdmin) {
                next();
            } else {
                req.flash("Errore", "Non ha il permesso per farlo!");
                res.redirect("/principale/" + req.params.id);
            }
        } else {
            req.flash("Errore", "Deve essere registrato per farlo!");
            res.redirect("login");
        }
    },
    isNotLoggedIn: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect("/principale");
    },

}
