const axios = require("axios");

const c = require("./constants");

const appToken = {
  token: null,
  expiration: null
};

async function getToken() {

  try {

    const url = "https://id.twitch.tv/oauth2/token"
      + "?client_id=" + c.CLIENT_ID
      + "&client_secret=" + c.TWITCH_API_CLIENT_SECRET
      + "&grant_type=client_credentials";

    let res = await axios.post(url);

    appToken.token = res.data.access_token;
    appToken.expiration = Math.floor(Date.now() / 1000) + res.data.expires_in;
  }
  catch (err) {
    console.log("Error:", err.message);
  }
}

async function isTokenValid(token) {

  if (!token) return false;

  try {

    let url = "https://id.twitch.tv/oauth2/validate";

    let res = await axios.get(url, {
      headers: { Authorization: "OAuth " + token }
    });

    if (res.data.client_id === c.CLIENT_ID) return true;
    return false;
  }
  catch (err) {

    console.log("Error:", err.message);
    return false;
  }
}

function isTokenExpiring(expiration) {

  const finalWeekStart = expiration - 604800;
  const now = Math.floor(Date.now() / 1000);

  if (now >= finalWeekStart) return true;
  return false;
}

// check validity of current appToken every hour
// if invalid or expiring within 7 days, get a new one
async function generateAppToken() {

  try {

    const validToken = await isTokenValid(appToken.token);

    if (!validToken || isTokenExpiring(appToken.expiration)) {
      await getToken();
    }

    setTimeout(generateAppToken, 3600000);
  }

  catch (err) {
    console.log("Error:", err.message);
  }
}

module.exports = {
  appToken: appToken,
  generateAppToken: generateAppToken
};
