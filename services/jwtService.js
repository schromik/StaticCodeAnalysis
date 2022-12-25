const jwt = require("jsonwebtoken");

const SECRET = "myPrivateKey12345";

exports.createToken = function(user) {
    // create payload
    let payload = {
        username: user.username,
        role: user.role
    };

    // create the JWT and sign it
    let token = jwt.sign(payload, SECRET, {
        expiresIn: "90 days"
    });
    return token;
}