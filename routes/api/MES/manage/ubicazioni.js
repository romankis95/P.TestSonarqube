/**librerie */
const express = require("express");
const router = express.Router();
const ip = require('ip');
const moment = require("moment");
const UBICAZIONI = require("../../../../models/ubicazione");


router.get("/searchmaterial", async (req, res) => {
    try {
        var materiale = req.query.materiale || null;
        var ubicazioni = [];
        if (materiale) {
            ubicazioni = await UBICAZIONI.find({
                articolo: materiale.toString()
            }).lean();
            return res.json(ubicazioni);
        } else {
            return res.json(ubicazioni);
        }
    } catch (error) {
        return [];
    }
});


module.exports = router;