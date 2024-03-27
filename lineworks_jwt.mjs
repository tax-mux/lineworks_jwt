import dotenv from 'dotenv';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import request from 'request';

dotenv.config();

/**
 * デバッグモードの時にログを出力する。
 * @param {*} message 
 */
async function debugLog(message) {
    if (process.env.DEBUG_MODE === "True") {
        if (message !== undefined) {
            console.log(message);
        } else {
            console.log();

        }
    }
}

/**
 * jwtでアクセストークンを取得する。
 * privatekeyはprivatekey.penを読み込む。
 * ハッシュアルゴリズムはRS256を用いる。
 * @return {string} アクセストークン
 */
async function getAccessToken() {
    let jwtHeader = { "alg": "RS256", "typ": "JWT" };
    debugLog("JWT_HEADER:");
    debugLog(JSON.stringify(jwtHeader));
    debugLog();

    let jwtClaimSet = {
        "iss": process.env.LINEWORKS_CLIENT_ID,
        "sub": process.env.LINEWORKS_SERVICE_ACCOUNT_ID,
        "iat": Math.floor(Date.now() / 1000),
        "exp": Math.floor(Date.now() / 1000) + 60 * 60
    };

    debugLog("JWT_CLAIMSET:");
    debugLog(JSON.stringify(jwtClaimSet));
    debugLog();

    let private_key = fs.readFileSync('privatekey.pem', 'utf8');
    debugLog("PRIVATE_KEY:");
    debugLog(private_key);
    debugLog();

    let assertion = jwt.sign(jwtClaimSet, private_key, { algorithm: 'RS256', header: jwtHeader });
    debugLog("ASSERTION:");
    debugLog(assertion);
    debugLog();

    // LineworksにPOSTし、アクセストークンを取得する。
    let options = {
        url: 'https://auth.worksmobile.com/oauth2/v2.0/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
            "assertion": assertion,
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "client_id": process.env.LINEWORKS_CLIENT_ID,
            "client_secret": process.env.LINEWORKS_CLIENT_SECRET,
            "scope": process.env.LINEWORKS_SCOPE
        }
    };
    debugLog("POST_OPTIONS:");
    debugLog(JSON.stringify(options));
    debugLog();
    return new Promise((resolve, reject) => {
        request.post(options, (error, response, body) => {
            debugLog("POST_RESPONSE:");
            debugLog(JSON.stringify(response));
            debugLog();
            if (error) {
                reject(error);
            } else {
                debugLog("POST_BODY:");
                debugLog(body);
                debugLog();
                resolve(JSON.parse(body).access_token);
            }
        });
    });
}

export {
    debugLog, getAccessToken
};
