module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es2021": true
    },
    /*"extends": "eslint:recommended",*/
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "plugins":[
        "custom-rules"
    ],
    "rules": {
        "custom-rules/no-empty-catch": 2,
        "custom-rules/no-return-trycatch": 2,
    }
}
