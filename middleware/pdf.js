const express = require('express');
const router = express.Router();

const auth = require("./auth.js");
const pdfService = require("../services/pdfService.js");

module.exports = function (passport){
    
    router.get("/:username", passport.authenticate("jwt", { session: false }), auth.userReadPermission, async function (req, res) {
        const stream = res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment;filename=${req.params.username}.pdf`
        });
        await pdfService.buildPDF(
            (chunk) => stream.write(chunk),
            () => stream.end(),
            req.params.username
        );
    });

    return router
}