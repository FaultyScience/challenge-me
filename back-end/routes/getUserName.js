const express = require("express");
const jwt = require("jsonwebtoken");

const msg = require("./resources/messages");
const c = require("./resources/constants");
const api = require("./resources/twitchApi");

const router = express.Router();

// route to get viewer's twitch user name using user id
router.post("/get-user-name", async (req, res) => {

  let successMsg = msg.GET_USER_NAME_SUCCESS;
  let status = 200;
  let userId = null;
  let userName = null;

  try {

    const decoded_token = jwt.verify(req.body.token, c.TWITCH_SECRET);
    userId = decoded_token.user_id;
    const resp = await api.getUserName(userId);

    if (!resp.data) {

      successMsg = msg.GET_USER_NAME_FAIL;
      status = 400;

    } else {
      userName = resp.data.data[0].display_name;;
    }
  }
  catch (err) {

    successMsg = msg.GET_USER_NAME_FAIL;
    status = 400;

    console.log(err);
  }

  const body = {
    message: successMsg,
    parameters: { token: req.body.token },
    userId: userId,
    userName: userName
  };

  const response = {
    statusCode: status,
    body: body
  };

  console.log(body.message);
  res.status(status).send(response);
});

module.exports = router;
