const express = require("express");
const jwt = require("jsonwebtoken");

const msg = require("./resources/messages");
const c = require("./resources/constants");
const api = require("./resources/twitchApi");

const router = express.Router();

// route to get streamer's configuration for challengeme
router.post("/get-config", async (req, res) => {

  let successMsg = msg.GET_CONFIG_SUCCESS;
  let status = 200;
  let data = null;

  const channelId = req.body.channelId;

  const payload = {
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    user_id: c.DEV_ID,
    role: "external"
  };

  const token = jwt.sign(payload, c.TWITCH_SECRET, { noTimestamp: true });
  const resp = await api.getConfig(token, channelId);
  
  if (!resp.record) {

    successMsg = msg.GET_CONFIG_FAIL;
    status = resp;

  } else {
    data = JSON.parse(resp.record.content);
  }

  const body = {
    message: successMsg,

    parameters: {
      channelId: channelId
    },

    slAuth: data ? data.slAuth : null,
    server: data ? data.server : null,
    summonerId: data ? data.summonerId : null,
    minChallengeBits: data ? data.minChallengeBits : null,
    maxKills: data ? data.maxKills : null,
    minDeaths: data ? data.minDeaths : null,
    minBountyBits: data ? data.minBountyBits : null,
    maxDeathPenalty: data ? data.maxDeathPenalty : null,
    alertToggle: data? data.alertToggle : null,
    minChallengeAlerts: data ? data.minChallengeAlerts : null,
    minBountyAlerts: data ? data.minBountyAlerts : null
  };

  const response = {
    statusCode: status,
    body: body
  };

  console.log(body.message);
  res.status(status).send(response);
});

module.exports = router;
