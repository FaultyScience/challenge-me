const axios = require("axios");

const c = require("./constants");
const appToken = require("./appToken").appToken;

// methods to interact with twitch api

// post message in chat box
async function postChatMsg(token, channelId, msg) {

  try {

    const url = "https://api.twitch.tv/extensions/" + c.CLIENT_ID + "/"
      + c.VERSION + "/channels/" + channelId + "/chat";
    const data = { text: msg };

    const res = await axios.post(url, data, {

      headers: {
        Authorization: "Bearer " + token,
        "Client-ID": c.CLIENT_ID,
        "Content-Type": "application/json"
      }
    });

    return 200;
  }

  catch (err) {

    console.log(err.message);
    return err.response.status;
  }
}

// get streamer's configuration for challengeme
async function getConfig(token, channelId) {

  try {

    const url = "https://api.twitch.tv/extensions/" + c.CLIENT_ID
      + "/configurations/segments/broadcaster?channel_id=" + channelId;

    const res = await axios.get(url, {

      headers: {
        Authorization: "Bearer " + token,
        "Client-ID": c.CLIENT_ID,
        "Content-Type": "application/json"
      }
    });

    return res.data["broadcaster:" + channelId];
  }

  catch (err) {

    console.log(err.message);
    return err.response.status;
  }
}

// set streamer's configuration for challengeme
async function setConfig(token, channelId, content) {

  try {

    const url = "https://api.twitch.tv/extensions/" + c.CLIENT_ID
      + "/configurations";

    const data = {
      channel_id: channelId,
      segment: "broadcaster",
      content: content,
      version: c.VERSION
    };

    const res = await axios.put(url, data, {

      headers: {
        Authorization: "Bearer " + token,
        "Client-ID": c.CLIENT_ID,
        "Content-Type": "application/json"
      }
    });

    return 200;
  }

  catch (err) {

    console.log(err.message);
    return err.response.status;
  }
}

// set streamer's required configuration for challengeme - not operational
async function setRequiredConfig(token, channelId) {

  try {

    const url = "https://api.twitch.tv/extensions/" + c.CLIENT_ID + "/"
      + c.VERSION + "/required_configuration?channel_id=" + channelId;

    const data = {
      required_configuration: c.REQUIRED_CONFIG
    };

    const res = await axios.put(url, data, {

      headers: {
        Authorization: "Bearer " + token,
        "Client-ID": c.CLIENT_ID,
        "Content-Type": "application/json"
      }
    });

    return 200;
  }

  catch (err) {

    console.log(err.message);
    return err.response.status;
  }
}

// get viewer's twitch user name using user id
async function getUserName(userId) {

  try {

    if (!appToken.token) throw new Error(404);
    
    const url = "https://api.twitch.tv/helix/users?id=" + userId;

    const res = await axios.get(url, {

      headers: {
        Authorization: "Bearer " + appToken.token,
        "Client-ID": c.CLIENT_ID
      }
    });

    return res;
  }

  catch (err) {

    console.log(err.message);
    return err.response.status;
  }
}

module.exports = {
  postChatMsg: postChatMsg,
  getConfig: getConfig,
  setConfig: setConfig,
  setRequiredConfig: setRequiredConfig,
  getUserName: getUserName
};
