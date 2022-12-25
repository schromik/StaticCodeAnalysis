const express = require('express');
const router = express.Router();

const session = require("../services/jwtService.js");

module.exports = function(passport){
    
    //JWT erhalten
    router.get("/", passport.authenticate("basic", { session: false, failWithError: true }),
        function (req, res) {   
            let account= {
                username: req.user.username,
                role: req.user.role
            };
            res.status(200).json({ token: session.createToken(account) });
        },
        (err, req, res, next) => {
            res.removeHeader("www-authenticate");
            res.status(401).end();
        }
    );

    return router;
}