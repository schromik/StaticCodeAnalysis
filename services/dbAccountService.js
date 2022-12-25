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
SESSION CONTROLL
######
*/

//Überprüft die Credentials
exports.credentialsCheck = async function (credentials) {
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

//Gibt es den Account
exports.hasUser = async function (username) {
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

/*
######
CRUD
######
*/

//Einen Neuen Account Erstellen
exports.addAccount = async function (account) {
    let response = {
        result: false,
        message: null
    };

    try {
        await pool.query('INSERT INTO Accounts (username, userrole, passwordHash, firstname, surname, birthday) VALUES(?, ?, ?, ?, ?, ?);',
            [account.username, account.role, account.passwordHash, account.firstname, account.surname, account.birthday]);
        response.result = true;
        response.message = "DONE";
    } catch (err) {
        response.message = err.code;
        response.result = false;
    } finally {
        console.log("Add Account " + account.username + ": " + response.message);
        return response;
    }
};

//Einen Account Erhalten
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

        response.payload = await exports.getAccountByUsername(username);

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

//Alle Accounts Erhalten
exports.getAllAccounts = async function () {
    let response = {
        result: false,
        message: null,
        payload: []
    };
    try {
        let accounts = await pool.query("SELECT username FROM Accounts;");

        for (let element of accounts) {
            let tmp = await exports.getAccountByUsername(element.username);
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

//Einen Account Bearbeiten
exports.editAccount = async function (account, username) {
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

//Einen Account Löschen
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

//######
//GENERAL FUNCTIONS
//######

//Account aus der Datenbank holen und richtig formatieren
exports.getAccountByUsername = async function (username) {
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

//Datum richtig Formatieren
function dateFormat(date) {
    let year = date.getUTCFullYear().toString();
    let month = (date.getUTCMonth() + 1).toString();
    let day = date.getUTCDate().toString();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return year + "-" + month + "-" + day;
}