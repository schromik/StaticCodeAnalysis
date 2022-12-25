/*eslint no-empty: "off"*/
//using internal modules
const accountDB = require("./dbAccountService");
const profileDB = require("./dbProfileService");

//using bcryptjs
const bcrypt = require("bcryptjs");
const fs = require("fs");

const path = "./services/dummyData/";

exports.initDummy = async function(){
    console.log("###CREATE DUMMY START###");

    await createDummy("MatsHummels");
    await createDummy("MaxVerstappen");
    await createDummy("DarthVader");
    await createDummy("GandalfDergraue");
    await createDummy("Admin");
    await createDummy("ProjectManager");

    console.log("###CREATE DUMMY End###");
}

async function createDummy(name){
    console.log("CREATE " + name);
    let account;
    let profile;

    try{
        account = JSON.parse(fs.readFileSync(path + name + "Account.json", 'utf8'));
        account.passwordHash = bcrypt.hashSync("Passwort", 10);
        await accountDB.addAccount(account);
    }catch(err){
    }

    try{
        profile = JSON.parse(fs.readFileSync(path + name + "Profile.json", 'utf8'));
        await profileDB.addProfil(profile, account.username);
    }catch(err){
    }
}
