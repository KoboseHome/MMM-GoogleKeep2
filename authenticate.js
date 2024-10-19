const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const fs = require("fs");
const readline = require('readline');
const TOKEN_PATH = "token.json";
const SCOPES = ['https://www.googleapis.com/auth/keep.readonly'];

module.exports = function authenticate() {
    return new Promise((resolve, reject) => {
        const oAuth2Client = new OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, resolve, reject);
            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
        });
    });
};

function getAccessToken(oAuth2Client, resolve, reject) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return reject(err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            resolve(oAuth2Client);
        });
    });
}

/**
 * Lists the user's first 10 task lists.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listKeepLists(auth) {
  const service = google.keep({version: 'v1', auth});
  service.keeplists.list({
    maxResults: 10,
  }, (err, res) => {
    if (err) return console.error('The API returned an error: ' + err);
    const keepLists = res.data.items;
    if (keepLists) {
      console.log('Keep lists:');
      keepLists.forEach((keepList) => {
        console.log(`${keepList.title} (${keepList.id})`);
      });
    } else {
      console.log('No keep lists found.');
    }
  });
}
