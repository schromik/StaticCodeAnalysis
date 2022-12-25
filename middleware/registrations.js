const express = require('express');
const router = express.Router();

const accountDB = require("../services/dbAccountService.js");
const auth = require("./auth.js");
const session = require("../services/jwtService.js");

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

const bcrypt = require("bcryptjs");

module.exports = function (passport) {
    
    //Neuen Account Erstellen
    router.post('/', jsonParser, async function (req, res) {
        let account = {
            username: req.body.username,
            firstname: req.body.firstname,
            surname: req.body.surname,
            birthday: req.body.birthday,
            passwordHash: bcrypt.hashSync(req.body.pwd, 10),
            role: "user"
        };

        let response = await accountDB.addAccount(account);

        if (response.result) {
            res.status(201).json({ token: session.createToken(account) });;
        } else {
            res.status(500).send();
        }
    });

    //Alle Accounts erhalten
    router.get('/', jsonParser, passport.authenticate("jwt", { session: false }), auth.adminPermission, async function (req, res) {
        let response = await accountDB.getAllAccounts();

        if (response.result) {
            res.status(200).json(response.payload);;
        } else {
            res.status(500).send();
        }
    });

    //Einen Account erhalten
    router.get('/:username', jsonParser, passport.authenticate("jwt", { session: false }), auth.userReadPermission, async function (req, res) {
        let response = await accountDB.getAccount(req.params.username);

        if (response.result) {
            res.status(200).json(response.payload);;
        } else if (response.message == "DOES_NOT_EXIST") {
            res.status(404).send();
        } else {
            res.status(500).send();
        }
    });

    //Einen Account bearbeiten
    router.put('/:username', jsonParser, passport.authenticate("jwt", { session: false }), auth.userWritePermission, async function (req, res) {
        let response = await accountDB.editAccount(req.body, req.params.username);

        if (response.result) {
            res.status(200).json();
        } else if (response.message == "DOES_NOT_EXIST") {
            res.status(404).send();
        } else {
            res.status(500).send();
        }
    });

    //Einen Account löschen
    router.delete('/:username', jsonParser, passport.authenticate("jwt", { session: false }), auth.adminPermission, async function (req, res) {
        let response = await accountDB.deleteAccount(req.params.username);

        if (response.result) {
            res.status(200).json();
        } else if (response.message == "DOES_NOT_EXIST") {
            res.status(404).send();
        } else {
            res.status(500).send();
        }
    });

    return router;
}