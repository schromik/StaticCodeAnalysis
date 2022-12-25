/*eslint no-unused-vars: "error"*/
//Modules
const express = require("express");
const init = require("./services/initService.js");
const db = require("./services/dbAccountService.js");

const passport = require("passport");
const BasicStrategy = require("passport-http").BasicStrategy;
const passportJwt = require("passport-jwt");

//Passport
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const SECRET = "myPrivateKey12345";

passport.use(
    new BasicStrategy(async function (username, password, done) {
        //get data from Database
        let databaseResponse = await db.credentialsCheck({ username: username, password: password });
        
        if (databaseResponse.result) {
            console.log(`user ${username} logged in`);
            return done(null, databaseResponse.payload);
        }
        // user doesn't exist or wrong password
        return done(null, false);
    })
);

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("jwt"),
            secretOrKey: SECRET
        },
        async function (jwtPayload, done) {
            if (await db.hasUser(jwtPayload.username)) {
                console.log(`User ${jwtPayload.username} was authenticated by a valid JWT`);
                return done(null, jwtPayload);
            }
            console.log(`User ${jwtPayload.username} doesn't exist`);
            return done(null, false);
        }
    )
);

//app
const app = express();

app.use(function (req, res, next) {
    console.log("###" + req.method + ":" +req.url + "###")
    // Website, die sich verbinden darf: Angular WDS -- alternativ: '*' für alle Quellen
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    // Angabe der erlaubten HTTP Methoden
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    // Angabe der erlaubten request Header
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // Request zur nächsten Schicht der Middleware weiterleiten
    next();
});

app.use(express.static("public"));
app.use('/token', require("./middleware/token.js")(passport));
app.use('/registrations', require("./middleware/registrations.js")(passport));
app.use('/skillprofiles', require("./middleware/skillprofiles.js")(passport));
app.use('/pdf', require("./middleware/pdf.js")(passport));

app.get('*', function(req, res){
    console.log("Not Found");
    res.status(404).send();
});

app.put('*', function(req, res){
    console.log("Not Found");
    res.status(404).send();
});

app.post('*', function(req, res){
    console.log("Not Found");
    res.status(404).send();
});

app.delete('*', function(req, res){
    console.log("Not Found");
    res.status(404).send();
});

app.listen(3000, () => {
    console.log("Server online");
    //init.initDummy();
});

try { foo() } catch (e) {}