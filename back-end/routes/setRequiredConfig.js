const express = require("express");
const jwt = require("jsonwebtoken");

const msg = require("./resources/messages");
const c = require("./resources/constants");
const api = require("./resources/twitchApi");

const router = express.Router();

// route to get streamer's required configuration for challengeme (not operational)
router.post("/set-required-config", async (req, res) => {

  let successMsg = msg.REQUIRED_CONFIG_SUCCESS;
  let status = 200;

  const channelId = req.body.channelId;

  const payload = {
    exp: Math.floor(Date.now() / 1000) + (60 * 60),
    user_id: c.DEV_ID,
    role: "external"
  };

  const token = jwt.sign(payload, c.TWITCH_SECRET, { noTimestamp: true });
  const resp = await api.setRequiredConfig(token, channelId);

  if (resp !== 200) {

    successMsg = msg.REQUIRED_CONFIG_FAIL;
    status = resp;
  }

  const body = {
    message: successMsg,

    parameters: {
      channelId: channelId
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
