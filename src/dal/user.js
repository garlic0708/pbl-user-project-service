import * as AWS from 'aws-sdk';
import {promisify} from 'util';
import {cognitoPoolId} from "../config";
import DataLoader from 'dataloader'

let idp;

function getIdp() {
    if (!idp)
        idp = new AWS.CognitoIdentityServiceProvider({
            apiVersion: '2016-04-18',
            region: 'us-west-2',
        });
    return idp
}

async function getUserRaw(username) {
    const idp = getIdp();

    const result = await promisify(idp.adminGetUser).bind(idp)({
        UserPoolId: cognitoPoolId,
        Username: username,
    });
    result.UserAttributes = result.UserAttributes.reduce((acc, {Name, Value}) => {
        acc[Name] = Value;
        return acc
    }, {});
    return {
        username: result.Username,
        ...result.UserAttributes,
    }
}

const dataLoader = new DataLoader(keys =>
    Promise.all(keys.map(username => getUserRaw(username))));

export async function getUser(username) {
    return dataLoader.load(username)
}
