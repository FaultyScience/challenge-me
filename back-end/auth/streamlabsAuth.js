const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const c = require("../routes/resources/constants");
const twitchApi = require("../routes/resources/twitchApi");

const router = express.Router();

const slTokens = {};

// send streamlabs auth or auth denied html, and store sl token
router.get("/streamlabs", async (req, res) => {

  try {

    if (req.query.code) {

      const url = "https://streamlabs.com/api/v1.0/token";

      const data = {
        grant_type: "authorization_code",
        client_id: c.SL_CLIENT_ID,
        client_secret: c.SL_CLIENT_SECRET,
        redirect_uri: c.REDIRECT_URI,
        code: req.query.code
      };

      const resp = await axios.post(url, data);
      const accessToken = resp.data.access_token;
      const slToken = jwt.sign(accessToken, c.SL_CLIENT_SECRET);
      slTokens[req.connection.remoteAddress] = slToken;

      res.status(200).sendFile("./streamlabsAuth.html", { root: __dirname });

    } else {
      res.status(200).sendFile("./streamlabsAuthDenied.html", { root: __dirname });
    }
  }
  catch (err) {

    console.log(err);
    res.sendStatus(404);
  }
});

// send existing sl token
router.get("/sl-token", async (req, res) => {

  try {
    res.status(200).send(slTokens[req.connection.remoteAddress]);
  }
  catch (err) {

    console.log(err);
    res.status(503).send(err);
  }
});

module.exports = router;
