const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

async function getSecret(secret_name) {
    const client = new SecretsManagerClient({
        region: "us-west-1",
    });
    let response;

    try {
        response = await client.send(
        new GetSecretValueCommand({
            SecretId: secret_name,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        }));
    } catch (err) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw err;
    }

    let secret = response.SecretString;
    console.log(secret);
    return secret;
}

async function getSecretDev(secret_name) {
    console.log(secret_name);
    let secret = process.env.MAPBOX_TOKEN;
    return secret;
}

module.exports = getSecret;