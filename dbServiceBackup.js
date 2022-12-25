const mariadb = require('mariadb');
const dbHost = "db";
const dbUser = "root";
const dbPassword = "mySecret12345"
const dbDatabase = "skillprofile";

const bcrypt = require('bcryptjs');

const pool = mariadb.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbDatabase,
    connectionLimit: 5
});

/*
######
ACCOUNTS AND SESSION CONTROLL
######
*/

exports.credentialsCheck = async function (credentials) {
    //erstellt die response
    let response = {
        result: false,
        message: null,
        payload: {
            username: null,
            role: null
        }
    };

    try {
        let tmp = await pool.query('SELECT * FROM Accounts WHERE username=?', [credentials.username]);

        if (credentials.username == tmp[0].username && bcrypt.compareSync(credentials.password, tmp[0].passwordHash)) {
            response.result = true;
            response.message = "DONE";
            response.payload.username = tmp[0].username;
            response.payload.role = tmp[0].userrole;
        } else {
            response.result = false;
            response.message = "WRONG_CREDENTIALS";
        }
    } catch (err) {
        response.message = err.code;
        response.result = false;
    } finally {
        console.log("Credentials Check " + credentials.username + ": " + response.message);
        return response;
    }
};

exports.hasUser = async function (username) {
    //erstellt die response
    let response = {
        result: false,
        message: null,
    };
    try {
        let user = await pool.query('SELECT username FROM Accounts WHERE username=?', [username]);
        if (user[0].username == username) {
            response.result = true;
            response.message = "DONE";
        } else {
            response.message = "NO_USER";
        }
    } catch (err) {
        response.message = "NO_USER";
        response.result = false;
    } finally {
        console.log("Has User " + username + ": " + response.message);
        return response.result;
    }
}

exports.addAccount = async function (account) {
    //erstellt die response
    let response = {
        result: false,
        message: null
    };

    try {
        //versucht Account zu erstellen
        await pool.query('INSERT INTO Accounts (username, userrole, passwordHash, firstname, surname, birthday) VALUES(?, ?, ?, ?, ?, ?);',
            [account.username, account.role, account.passwordHash, account.firstname, account.surname, account.birthday]);
        response.result = true;
        response.message = "DONE";
    } catch (err) {
        //fängt Fehler bei der Erstellung des Accounts ab
        response.message = err.code;
        response.result = false;
    } finally {
        console.log("Add Account " + account.username + ": " + response.message);
        return response;
    }
};

exports.getAccount = async function (username) {
    let response = {
        result: false,
        message: null,
        payload: null
    };

    try {
        if (!(await exports.hasUser(username))) {
            response.message = "DOES_NOT_EXIST";
            response.result = false;
            throw response.message;
        }

        response.payload = await getAccountByUsername(username);

        response.message = "DONE"
        response.result = true;

    } catch (err) {
        if (response.message == "DOES_NOT_EXIST") response.message = err;
        else response.message = err.code;
        response.result = false;
    }
    finally {
        console.log("Get one Account: " + response.message);
        return response;
    }
}

exports.getAllAccounts = async function () {
    let response = {
        result: false,
        message: null,
        payload: []
    };
    try {
        let accounts = await pool.query("SELECT username FROM Accounts;");

        for (let element of accounts) {
            let tmp = await getAccountByUsername(element.username);
            response.payload.push(tmp);
        }
        response.result = "DONE";
    } catch (err) {
        response.message = err.code;
        response.result = false;
    }
    finally {
        console.log("Get All Accounts: " + response.message);
        return response;
    }
}

exports.editAccount = async function (account, username) {
    //erstellt die response
    let response = {
        result: false,
        message: null,
    };
    console.log(account);
    try {
        if (!(await exports.hasUser(username))) {
            response.message = "DOES_NOT_EXIST";
            response.result = false;
            throw response.message;
        }

        await pool.query
            ('UPDATE Accounts SET username = ?, firstname = ?, surname = ?, birthday = ?, userrole = ? WHERE username = ?;',
                [account.username, account.firstname, account.surname, account.birthday, account.role, username]);

        response.message = "DONE";
        response.result = true;
    } catch (err) {
        if (response.message == "DOES_NOT_EXIST") response.message = err;
        else response.message = err.code;
        response.result = false;
    } finally {
        console.log("Edit One Account: " + response.message);
        return response;
    }
}

exports.deleteAccount = async function (username) {
    let response = {
        result: false,
        message: null,
    };

    try {
        if (!(await exports.hasUser(username))) {
            response.message = "DOES_NOT_EXIST";
            response.result = false;
            throw response.message;
        }

        //Delete Account
        await pool.query('DELETE FROM Accounts WHERE username = ?;', [username]);

        response.message = "DONE"
        response.result = true;

    } catch (err) {
        console.log(err);
        if (response.message != "DOES_NOT_EXIST") response.message = err.code;
        response.result = false;
    }
    finally {
        console.log("DELETE one account: " + response.message);
        return response;
    }
}

/*
######
SKILLPROFILE
######
*/

//Erstellt neues Profil
exports.addProfil = async function (profile, username) {
    //erstellt die response
    let response = {
        result: false,
        message: null
    };

    //try to insert the profile data into the tables
    try {
        if ((await profileExists(username))) {
            response.message = "PROFILE_ALREADY_EXISTS";
            response.result = false;
            throw response.message;
        }

        //Insert into Profiles
        await pool.query
            ('INSERT INTO Profiles (username, job, company, nationality, email, phone, city) VALUES(?, ?, ?, ?, ?, ?, ?);',
                [username, profile.general.job, profile.general.company, profile.general.nationality, profile.general.email, profile.general.phone, profile.general.city]);

        let profileID = await pool.query('SELECT profileID FROM Profiles WHERE username=?', [username]);

        //Insert into KeyStrengths
        for (let i = 0; i < profile.keyStrengths.length; i++) {
            let tmp = await insertKeyStrength(profile.keyStrengths[i], profileID[0].profileID);
            if (!tmp) throw "INSERT_ERROR";
        }

        //Insert into Skills
        if (profile.skills[0].skill != '') {
            for (let i = 0; i < profile.skills.length; i++) {
                let tmp = await insertSkill(profile.skills[i].skill, profile.skills[i].rating, profileID[0].profileID);
                if (!tmp) throw "INSERT_ERROR";
            }
        }

        //Insert into Projects
        if (profile.projects[0].project != '') {
            for (let i = 0; i < profile.projects.length; i++) {
                let tmp = await insertProject(profile.projects[i], profileID[0].profileID);
                if (!tmp) throw "INSERT_ERROR";
            }
        }

        //Insert into Qualifications
        if (profile.qualifications[0].place != '') {
            for (let i = 0; i < profile.qualifications.length; i++) {
                let tmp = await insertQualification(profile.qualifications[i], profileID[0].profileID);
                if (!tmp) throw "INSERT_ERROR";
            }
        }

        response.result = true;
        response.message = "DONE";

    } catch (err) {
        if (response.message == "PROFILE_ALREADY_EXISTS" || response.message == "INSERT_ERROR") response.message = err;
        else response.message = err.code;
        response.result = false;

    } finally {
        console.log("Add Profile " + username + ": " + response.message);
        return response;
    }
};


exports.getSkillprofile = async function (username) {
    let response = {
        result: false,
        message: null,
        payload: []
    };

    try {
        if (!(await profileExists(username))) {
            response.message = "DOES_NOT_EXIST";
            response.result = false;
            throw response.message;
        }

        response.payload.push(await getProfileByUsername(username));

        response.message = "DONE"
        response.result = true;

    } catch (err) {
        console.log(err);
        if (response.message != "DOES_NOT_EXIST") response.message = err.code;;
        response.result = false;
    }
    finally {
        console.log("Get one profile: " + response.message);
        return response;
    }

};

exports.getAllSkillprofiles = async function (filter) {
    let response = {
        result: false,
        message: null,
        payload: []
    };

    try {
        //build query
        let query = "SELECT DISTINCT Profiles.username FROM Profiles " +
            "INNER JOIN Accounts ON Profiles.username = Accounts.username " +
            "RIGHT OUTER JOIN ProfileSkills ON Profiles.profileID = ProfileSkills.profileID " +
            "INNER JOIN Skills ON ProfileSkills.skillID = Skills.skillID";

        // where skillname IN ('Lichtschwertkampf','Laut Atmen') GROUP BY Profiles.username HAVING COUNT(*) = 2;
        
        if (filter){
            query = query + " WHERE 1=1"
        }
        
        //checks the name
        if (filter.name) {
            query = query + " AND (Accounts.firstname LIKE '%" + filter.name + "%' OR Accounts.surname LIKE '%" + filter.name + "%')";
        }

        //checks the job
        if (filter.job) {
            query = query + " AND Profiles.job LIKE '%" + filter.job + "%'";
        }

        if (filter.skills) {
            let skills = filter.skills.split(",");
            query = query + " AND skillname IN ("
            query = query + "'" + skills[0] + "'";
            for (let i = 1; i < skills.length; i++){
                query = query + ",'" + skills[i] + "'";
            }
            query = query + ") GROUP BY Profiles.username HAVING COUNT(*) = " + skills.length
        }
        
        //finish query
        query = query + ";";
        let profiles = await pool.query(query);

        for (let i = 0; i < profiles.length; i++) {
            response.payload.push(await getProfileByUsername(profiles[i].username));
        }

        response.message = "DONE"
        response.result = true;

    } catch (err) {
        console.log(err);
        response.message = err.code;
        response.result = false;
    }
    finally {
        console.log("Get all profiles: " + response.message);
        return response;
    }
};

exports.editSkillprofile = async function (profile, username) {
    let response = {
        result: false,
        message: null,
        payload: []
    };

    try {
        if (!(await profileExists(username))) {
            response.message = "DOES_NOT_EXIST";
            response.result = false;
            throw response.message;
        }

        //Get ProfileID
        let profileID = (await pool.query('SELECT profileID FROM Profiles WHERE username=?', [username]))[0].profileID;

        //Edit Profile
        await pool.query
            ('UPDATE Profiles SET job = ?, company = ?, nationality = ?, email = ?, phone = ?, city= ? WHERE profileID = ?;',
                [profile.general.job, profile.general.company, profile.general.nationality, profile.general.email, profile.general.phone, profile.general.city, profileID]);

        //Delete old KeyStrength
        await pool.query('DELETE FROM KeyStrengths WHERE profileID = ?;', [profileID]);

        //Insert new KeyStrength
        for (let i = 0; i < profile.keyStrengths.length; i++) {
            let tmp = await insertKeyStrength(profile.keyStrengths[i], profileID);
            if (!tmp) throw "INSERT_ERROR"
        }

        //Delete old Skills
        await pool.query('DELETE FROM ProfileSkills WHERE profileID = ?;', [profileID]);

        //Insert new Skills
        for (let i = 0; i < profile.skills.length; i++) {
            let tmp = await insertSkill(profile.skills[i].skill, profile.skills[i].rating, profileID);
            if (!tmp) throw "INSERT_ERROR";
        }

        //Delete old Qualifications
        await pool.query('DELETE FROM Qualifications WHERE profileID = ?;', [profileID]);

        //Insert new Qualifications
        for (let i = 0; i < profile.qualifications.length; i++) {
            let tmp = await insertQualification(profile.qualifications[i], profileID);
            if (!tmp) throw "INSERT_ERROR"
        }

        //Delete old Projects
        await pool.query('DELETE FROM Projects WHERE profileID = ?;', [profileID]);

        //Insert new Projects
        for (let i = 0; i < profile.projects.length; i++) {
            let tmp = await insertProject(profile.projects[i], profileID);
            if (!tmp) throw "INSERT_ERROR"
        }

        response.message = "DONE"
        response.result = true;

    } catch (err) {
        console.log("Edit: " + err);
        if (response.message != "DOES_NOT_EXIST" || "INSERT_ERROR") response.message = err.code;
        response.result = false;
    }
    finally {
        console.log("Edit one profile: " + response.message);
        return response;
    }
};

exports.deleteSkillprofile = async function (username) {
    let response = {
        result: false,
        message: null,
    };

    try {
        if (!(await profileExists(username))) {
            response.message = "DOES_NOT_EXIST";
            response.result = false;
            throw response.message;
        }

        //Get ProfileID
        let profileID = (await pool.query('SELECT profileID FROM Profiles WHERE username=?', [username]))[0].profileID;

        //Delete Profile
        await pool.query('DELETE FROM Profiles WHERE profileID = ?;', [profileID]);

        response.message = "DONE"
        response.result = true;

    } catch (err) {
        console.log("Edit: " + err);
        if (response.message != "DOES_NOT_EXIST") response.message = err.code;
        response.result = false;
    }
    finally {
        console.log("DELETE one profile: " + response.message);
        return response;
    }
}

/*
######
PRIVATE FUNCTIONS
######
*/

//###
//Getter
//###

async function getProfileByUsername(username) {
    tmp = await pool.query('SELECT profileID FROM Profiles WHERE username=?', [username]);
    profileID = tmp[0].profileID

    //Define SQL Querys
    const sqlGeneral = "SELECT job,company,nationality,email,phone, city FROM Profiles WHERE username =  '" + username + "';";
    const sqlKeyStrenghts = "SELECT keyStrengthsInfo FROM KeyStrengths WHERE profileID =   '" + profileID + "';";
    const sqlSkills = "SELECT Skills.skillname,ProfileSkills.rating FROM ProfileSkills INNER JOIN Skills ON ProfileSkills.skillID=Skills.skillID WHERE profileID = '" + profileID + "'";
    const sqlProjects = "SELECT projectName, projectStart, projectEnd, projectInfo FROM Projects WHERE profileID =   '" + profileID + "';";
    const sqlQualifications = "SELECT qualificationStart,qualificationEnd,qualificationInfo,qualificationPlace FROM Qualifications WHERE profileID =   '" + profileID + "';";

    //Get data from Database
    let g = await pool.query(sqlGeneral);
    let k = await pool.query(sqlKeyStrenghts);
    let s = await pool.query(sqlSkills);
    let p = await pool.query(sqlProjects);
    let q = await pool.query(sqlQualifications);

    g = g[0];

    let accountInfo = await getAccountByUsername(username);

    let skillprofile = {
        accountInfo: accountInfo,
        skillprofile: {
            general: {
                "job": g.job,
                "company": g.company,
                "nationality": g.nationality,
                "email": g.email,
                "phone": g.phone,
                "city": g.city
            },
            keyStrengths: [],
            skills: [],
            projects: [],
            qualifications: []
        }
    }

    k.forEach(element => {
        skillprofile.skillprofile.keyStrengths.push(element.keyStrengthsInfo);
    });

    s.forEach(element => {
        tmp = {
            "skill": element.skillname,
            "rating": element.rating
        }
        skillprofile.skillprofile.skills.push(tmp);
    })

    p.forEach(element => {
        tmp = {
            "project": element.projectName,
            "start": dateFormat(element.projectStart),
            "end": dateFormat(element.projectEnd),
            "info": element.projectInfo
        }
        skillprofile.skillprofile.projects.push(tmp);
    })

    q.forEach(element => {
        tmp = {
            "start": dateFormat(element.qualificationStart),
            "end": dateFormat(element.qualificationEnd),
            "info": element.qualificationInfo,
            "place": element.qualificationPlace
        }
        skillprofile.skillprofile.qualifications.push(tmp);
    })

    return skillprofile;
}


getAccountByUsername = async function (username) {
    let response = {
        username: null,
        firstname: null,
        surname: null,
        birthday: null,
        role: null
    }

    let accountInfo = await pool.query("SELECT username, firstname, surname, birthday, userrole FROM Accounts WHERE username = ?;", [username]);

    response.username = username;
    response.firstname = accountInfo[0].firstname;
    response.surname = accountInfo[0].surname;
    response.birthday = dateFormat(accountInfo[0].birthday);
    response.role = accountInfo[0].userrole;
    return response;
}

//###
//Insert Into Tables
//###

async function insertKeyStrength(keyStrength, profileID) {
    try {
        await pool.query('INSERT INTO KeyStrengths (keyStrengthsInfo, profileID) VALUES(?,?);',
            [keyStrength, profileID]);
        return true;
    } catch (err) {
        return false;
    }
}

async function insertProject(project, profileID) {
    try {
        await pool.query('INSERT INTO Projects (projectName, projectInfo, projectStart, projectEnd, profileID) VALUES(?,?,?,?,?);',
            [project.project, project.info, project.start, project.end, profileID]);
        return true;
    } catch (err) {
        return false;
    }
}

async function insertQualification(qualification, profileID) {
    try {
        await pool.query
            ('INSERT INTO Qualifications (qualificationInfo, qualificationStart, qualificationEnd, qualificationPlace, profileID) VALUES(?,?,?,?,?);',
                [qualification.info, qualification.start, qualification.end, qualification.place, profileID]);
        return true;
    } catch (err) {
        return false;
    }
}

async function insertSkill(skill, rating, profileID) {
    try {
        if (!(await skillExists(skill))) { //Skill existiert nicht
            //Hole die dazugehörige skillID
            //Falls Skill nicht existiert -> schreibe skillname in Datenbank
            await pool.query('INSERT INTO Skills (skillname) VALUES (?);',
                [skill]);
        }
        //Hole die dazugehörige skillID
        let skillID = await pool.query('SELECT skillID FROM Skills WHERE skillname=?', [skill]);
        //Schreibe in Datenbank
        await pool.query('INSERT INTO ProfileSkills (profileID, skillID, rating) VALUES (?,?,?);',
            [profileID, skillID[0].skillID, rating]);
        return true;
    } catch (err) {
        return false;
    }
}

//###
//Exists 
//####

async function skillExists(skill) {
    let e = await pool.query('SELECT skillname FROM Skills WHERE skillname =  ?', [skill]);
    if (e == '') {
        return false;
    } else {
        return true;
    }
};


async function profileExists(username) {
    let e = await pool.query('SELECT profileID FROM Profiles WHERE username=?', [username]);

    try {
        if (e[0].profileID) {
            return true;
        }
    } catch {
        return false;
    }
};

//######
//GENERAL FUNCTIONS
//######

function dateFormat(date) {
    let year = date.getUTCFullYear().toString();
    let month = (date.getUTCMonth() + 1).toString();
    let day = date.getUTCDate().toString();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return year + "-" + month + "-" + day;
}