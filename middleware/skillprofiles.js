const express = require('express');
const router = express.Router();

const profileDB = require("../services/dbProfileService.js");
const auth = require("./auth.js")

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

module.exports = function (passport) {

    //Ein Profil Erstellen
    router.post("/:username", jsonParser, passport.authenticate("jwt", { session: false }), auth.userWritePermission,
        async function (req, res) {
            let response = await profileDB.addProfil(req.body, req.params.username);
            if (response.result) {
                res.status(201).send();
            } else {
                res.status(500).send();
            }
        }
    );

    //Ein Profil Bearbeiten
    router.put('/:username', jsonParser, passport.authenticate("jwt", { session: false }), auth.userWritePermission, async function (req, res) {
        let response = await profileDB.editSkillprofile(req.body, req.params.username);

        if (response.result) {
            res.status(200).send();
        } else if (response.message == "DOES_NOT_EXIST") {
            res.status(404).send();
        } else {
            res.status(500).send();
        }
    });

    //Ein Profil Erhalten
    router.get("/:username", jsonParser, passport.authenticate("jwt", { session: false }), auth.userReadPermission, async function (req, res) {
        let response = await profileDB.getSkillprofile(req.params.username);

        if (response.result) {
            res.status(200).json(response.payload);
        } else if (response.message == "DOES_NOT_EXIST") {
            res.status(404).send();
        } else {
            res.status(500).send();
        }
    }
    );

    //Alle Skillprofile Erhalten
    router.get("/", jsonParser, passport.authenticate("jwt", { session: false }), auth.pmPermission, async function (req, res) {
        let response = await profileDB.getAllSkillprofiles(req.query);

        if (response.result) {
            res.status(200).json(response.payload);
        } else {
            res.status(500).send();
        }
    }
    );

    //Ein Skillprofil erhalten
    router.get("/skillprofile/:username", jsonParser, passport.authenticate("jwt", { session: false }), auth.userReadPermission, async function (req, res) {
            let response = await profileDB.getSkillprofile(req.params.username);

            if (response.result) {
                res.status(200).json(response.payload);
            } else if (response.message == "DOES_NOT_EXIST") {
                res.status(404).send();
            } else {
                res.status(500).send();
            }
        }
    );

    //Ein Skillprofil erhalten
    router.delete("/skillprofile/:username", jsonParser, passport.authenticate("jwt", { session: false }), auth.adminPermission, async function (req, res) {
            let response = await profileDB.deleteSkillprofile(req.params.username);

            if (response.result) {
                res.status(200).json(response.payload);
            } else if (response.message == "DOES_NOT_EXIST") {
                res.status(404).send();
            } else {
                res.status(500).send();
            }
        }
    );

    return router;
}