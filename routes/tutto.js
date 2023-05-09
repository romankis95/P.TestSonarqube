const express = require("express");

const router = express.Router();
const User = require("../models/user")
const UBICAZIONE = require("../models/ubicazione");
const moment = require("moment");
const logger = require("./extensions/logger");
const sendmail = require("./extensions/nodemailer");
const middleware = require("../middleware");
const MOVIMENTI = require("../models/movimenti");
const MAGAZZINI = require("./../models/magazzino/magazzino");
const MARD = require("./../models/mard");
module.exports = router;