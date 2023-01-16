module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    /*"extends": "eslint:recommended",*/
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins":[
        "custom-rules"
    ],
    "rules": {
        "custom-rules/no-empty-catch": 2,
        "custom-rules/no-return-trycatch": 2,
    }
}




