const accountDB = require("../services/dbAccountService.js");

exports.userReadPermission = async function(req, res, next) {
    let userrole = await (await accountDB.getAccount(req.user.username)).payload.role;

    if(req.user.username == req.params.username || userrole == "pm" || userrole == "admin") next();
    else res.status(401).send();
}

exports.userWritePermission = async function(req, res, next) {
    let userrole = await (await accountDB.getAccount(req.user.username)).payload.role

    if(req.user.username == req.params.username || userrole == "admin") next();
    else res.status(401).send();
}

exports.pmPermission = async function(req, res, next) { 
    let userrole = await (await accountDB.getAccount(req.user.username)).payload.role
    
    if (userrole == "pm" || userrole == "admin")next();
    else res.status(401).send();
}

exports.adminPermission = async function(req, res, next) {
    let userrole = await (await accountDB.getAccount(req.user.username)).payload.role;
    
    if (userrole == "admin")next();
    else res.status(401).send();
}