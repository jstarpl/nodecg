import { onOAuthCode } from "../oauth";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import readline from "readline";

const SPREADSHEET_ID = "1pDLK6TmiMW-Kf6_oCfauIRC_XjUJBhdabvuSDGS6Lw8";

export function getTeamData(teamName: string): Promise<object[]> {
  return authorizeRequest((auth) => getTeam(auth, teamName));
}

export function getStatsData(): Promise<object[]> {
  return authorizeRequest((auth) => getStats(auth));
}

function authorizeRequest<T>(
  functionWithAuth: (auth: OAuth2Client) => Promise<T>
): Promise<T> {
  // Load client secrets from a local file.
  return new Promise((resolve, reject) => {
    fs.readFile("./credentials.json", { encoding: "utf8" }, (err, content) => {
      if (err) return console.log("Error loading client secret file:", err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), function (auth) {
        resolve(functionWithAuth(auth));
      });
    });
  });
}

/* Google Spreadsheets data */
// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "./token.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials: any, callback: (client: OAuth2Client) => void) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, { encoding: "utf8" }, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(
  oAuth2Client: OAuth2Client,
  callback: (client: OAuth2Client) => void
) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });

  console.log(`\nVisit this URL to authorize with Google: ${authUrl}`);

  onOAuthCode((code) => {
    oAuth2Client.getToken(code, (err, token) => {
      if (err || !token)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function getStats(auth: OAuth2Client): Promise<object[]> {
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: SPREADSHEET_ID,
        range: "Stats!A4:E9",
      },
      (err, res) => {
        if (err) {
          console.log("The API returned an error: " + err);
          reject(err);
          return;
        }

        const rows = res?.data.values;
        if (!rows) {
          resolve([]);
          return;
        }
        if (rows.length) {
          // Print columns A and E, which correspond to indices 0 and 4.
          resolve(
            rows.map((row) => ({
              proc1: row[0],
              val1: row[1],
              label: row[2],
              val2: row[3],
              proc2: row[4],
            }))
          );
        } else {
          console.log("No data found.");
        }

        resolve([]);
      }
    );
  });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function getTeam(auth: OAuth2Client, teamName: string): Promise<object[]> {
  return new Promise((resolve, reject) => {
    const sheets = google.sheets({ version: "v4", auth });
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: SPREADSHEET_ID,
        range: teamName + "!A1:C",
      },
      (err, res) => {
        if (err) {
          console.log("The API returned an error: " + err);
          reject(err);
          return;
        }

        const rows = res?.data.values;
        if (!rows) {
          resolve([]);
          return;
        }
        if (rows.length) {
          // Print columns A and E, which correspond to indices 0 and 4.
          resolve(
            rows.map((row) => {
              if (row[0] !== "Trener:") {
                return {
                  num: row[0],
                  name: row[1],
                  name2: row[2],
                };
              } else {
                return {
                  coach: true,
                  name: row[1],
                };
              }
            })
          );
        } else {
          console.log("No data found.");
        }

        resolve([]);
      }
    );
  });
}
