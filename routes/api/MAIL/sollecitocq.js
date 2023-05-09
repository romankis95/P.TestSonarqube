/**librerie */
const express = require("express");
const router = express.Router();
const Mails = require("../../../models/mail");


//api/mail/cq
router.get("/elenca", async (req, res) => {
    return res.render("api/MAIL/sollecitocq", {
        title: "Sollecito CQ",
        mails: null
    });
});

router.get('/', (req, res) => {
    Mails.find({}, (err, mails) => {
        if (err) return res.status(400).send(err);
        res.status(200).json(mails);
    });
});

// Delete mail
router.delete('/:id', (req, res) => {
    Mails.findByIdAndRemove(req.params.id, (err, mail) => {
        if (err) return res.status(400).send(err);
        res.status(200).json({
            message: 'Mail deleted successfully'
        });
    });
});

router.post('/', (req, res) => {
    Mails.findOne({
        destinatario: req.body.destinatario.toString(),
        type: req.body.type.toString()
    }, (err, existingMail) => {
        if (err) return res.status(400).send(err);
        if (existingMail) return res.status(409).json({
            message: 'Mail already exists'
        });

        const mail = new Mails({
            destinatario: req.body.destinatario,
            type: req.body.type
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