"use strict";
const nodemailer = require("nodemailer");
const logger = require("./logger");

async function main(oggetto, messaggio) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'roman.kiss.appunti@gmail.com',
            pass: 'cutxobnuhrzoxzmv'
        }
});




    // send mail with defined transport object
let info = await transporter.sendMail({
        from: '"WannaBe MES👻" <roman.kiss.appunti@gmail.com>', // sender address
        to: "gestionale2@italtergi.com", // list of receivers
        subject: "" + oggetto, // Subject line
        text: "" + messaggio, // plain text body
        html: "" + messaggio, // html body
    }, function (err) {
        logger.error(JSON.stringify(err.message));
    });
    logger.verbose(JSON.stringify(info));
    logger.info(JSON.stringify("Mail inviata: " + oggetto));
}



module.exports = main;
