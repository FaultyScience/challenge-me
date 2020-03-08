const express = require("express");
const jwt = require("jsonwebtoken");

const msg = require("./resources/messages");
const c = require("./resources/constants");
const api = require("./resources/twitchApi");

const router = express.Router();

// route to post twitch chat message
router.post("/post-chat-msg", async (req, res) => {

  let successMsg = msg.CHAT_SUCCESS;
  let status = 200;

  const chatMsg = req.body.msg;
  const channelId = req.body.channelId;

  // post twitch chat message
  if (chatMsg !== "") {

    const payload = {
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      channel_id: channelId,
      user_id: c.DEV_ID,
      role: "external"
    };

    const twitchToken = jwt.sign(payload, c.TWITCH_SECRET, { noTimestamp: true });
    const res = await api.postChatMsg(twitchToken, channelId, chatMsg);

    if (res !== 200) {

      successMsg = msg.CHAT_FAIL;
      status = res;
    }

  } else {

    successMsg = msg.CHAT_FAIL;
    status = 400;
  }

  const body = {
    message: successMsg,

    parameters: {
      chatMsg: chatMsg,
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
