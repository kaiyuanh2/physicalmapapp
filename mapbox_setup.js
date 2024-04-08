const AWS = require('aws-sdk');
const secrets = new AWS.SecretsManager();

async function getSecret(secret_name) {
    try {
        const response = await secrets.getSecretValue({SecretId: secret_name}).promise();
        let secret = response.SecretString;
        return secret;
    } catch (err) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw err;
    }
}

async function getSecretDev(secret_name) {
    console.log(secret_name);
    let secret = process.env.MAPBOX_TOKEN;
    return secret;
}

module.exports = getSecret;