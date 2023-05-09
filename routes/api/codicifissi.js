/**librerie */
const express = require("express");
const router = express.Router();
const CodiciFissi = require("./../../models/codicifissi");
const MAGAZZINI = require("./../../models/magazzino/magazzino");

//api/codicifissi/
router.get("/elenca", async (req, res) => {
    try {
        const magazzini = await MAGAZZINI.find({}).lean();
        return res.render("api/CODICI_FISSI/fissi", {
            title: "Codici di cui le richieste finiscono sempre nello stesso magazzino",
            codici: null,
            magazzini: magazzini
        });
    } catch (error) {
        return res.render("api/CODICI_FISSI/fissi", {
            title: "Codici di cui le richieste finiscono sempre nello stesso magazzino",
            codici: null,
            magazzini: null
        });
    }
});

router.get('/', (req, res) => {
    CodiciFissi.find({}, (err, codici) => {
        if (err) return res.status(400).send(err);
        res.status(200).json(codici);
    });
});

router.get('/magazzini', (req, res) => {
    MAGAZZINI.find({}, (err, magazzini) => {
        if (err) return res.status(400).send(err);
        res.status(200).json(magazzini);
    });
});


// Delete mail
router.delete('/:id', (req, res) => {
    // eslint-disable-next-line no-unused-vars
    CodiciFissi.findByIdAndRemove(req.params.id, (err, codice) => {
        if (err) return res.status(400).send(err);
        res.status(200).json({
            message: 'Regola'
        });
    });
});

router.post('/', (req, res) => {
    let magazzino = req.body.magazzino || null;
    let codice = req.body.codice || null;
    if (magazzino == null || codice == null) {
        return res.status(400).json({
            message: 'Magazzino o codice non specificati'
        });
    }
    magazzino = magazzino.trim().toUpperCase();
    codice = codice.trim().toUpperCase();
    CodiciFissi.findOne({

        codice: codice.toString()
    }, (err, existingMail) => {
        if (err) return res.status(400).send(err);
        if (existingMail) return res.status(409).json({
            message: 'Codice already exists'
        });

        const mail = new CodiciFissi({
            magazzino: magazzino,
            codice: codice
        });
        mail.save((err, mail) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.status(201).json(mail);
        });
    });
});



module.exports = router;