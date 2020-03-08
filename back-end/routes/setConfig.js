const express = require("express");
const jwt = require("jsonwebtoken");

const msg = require("./resources/messages");
const c = require("./resources/constants");
const api = require("./resources/twitchApi");

const router = express.Router();

// route to set streamer's configuration for challengeme
router.post("/set-config", async (req, res) => {

  let successMsg = msg.SET_CONFIG_SUCCESS;
  let status = 200;

  const channelId = req.body.channelId;

  const content = JSON.stringify({
    slAuth: req.body.slAuth,
    server: req.body.server,
    summonerId: req.body.summonerId,
    minChallengeBits: req.body.minChallengeBits,
    maxKills: req.body.maxKills,
    minDeaths: req.body.minDeaths,
    minBountyBits: req.body.minBountyBits,
    maxDeathPenalty: req.body.maxDeathPenalty,
    alertToggle: req.body.alertToggle,
    minChallengeAlerts: req.body.minChallengeAlerts,
    minBountyAlerts: req.body.minBountyAlerts
  });

  const payload = {
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    user_id: c.DEV_ID,
    role: "external"
  };

  const token = jwt.sign(payload, c.TWITCH_SECRET, { noTimestamp: true });
  const resp = await api.setConfig(token, channelId, content);

  if (resp !== 200) {

    successMsg = msg.SET_CONFIG_FAIL;
    status = resp;
  }

  const body = {
    message: successMsg,

    parameters: {
      channelId: channelId,
      slAuth: req.body.slAuth,
      server: req.body.server,
      summonerId: req.body.summonerId,
      minChallengeBits: req.body.minChallengeBits,
      maxKills: req.body.maxKills,
      minDeaths: req.body.minDeaths,
      minBountyBits: req.body.minBountyBits,
      maxDeathPenalty: req.body.maxDeathPenalty,
      alertToggle: req.body.alertToggle,
      minChallengeAlerts: req.body.minChallengeAlerts,
      minBountyAlerts: req.body.minBountyAlerts
    }
  };

  const response = {
    statusCode: status,
    body: body
  };

  console.log(body.message);
  res.status(status).send(response);
});

module.exports = router;
