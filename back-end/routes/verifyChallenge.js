const express = require("express");
const jwt = require("jsonwebtoken");

const df = require("../filter/duplicateFilter");
const msg = require("./resources/messages");
const c = require("./resources/constants");
const lolApi = require("./resources/lolApi");
const slApi = require("./resources/slApi");
const twitchApi = require("./resources/twitchApi");
const createChallengeVerificationMsg = require("../messages/challengeVerificationMsg");

const router = express.Router();

// route to verify challenge
router.post("/verify-challenge", async (req, res) => {

  let verified = true;
  let verificationMsg = msg.VERIFICATION_SUCCESS;
  let gameTimeElapsed = null;
  let gameStartTime = null;
  let summonerId = null;
  let verificationToken = null;
  let status = 200;

  const channelId = req.body.channelId;
  const slAuth = req.body.slAuth;
  const server = req.body.server;
  const alertsEnabled = req.body.alertsEnabled;
  const minChallengeAlerts = req.body.minChallengeAlerts;
  const userId = req.body.userId;
  const userName = req.body.userName;
  const summonerName = req.body.summonerId;
  const type = req.body.type;
  const mustWin = req.body.mustWin;
  const minKills = req.body.minKills;
  const maxDeaths = req.body.maxDeaths;
  const bits = req.body.bits;

  const requestDescription = userName + "'s challenge submission for "
    + summonerName;

  // initial verification that should have been verified on front-end
  if ((type !== "challenge")
    || (!mustWin && (minKills === null) && (maxDeaths === null))
    || ((minKills !== null) && (minKills <= 0))
    || (maxDeaths < 0)
    || (bits <= 0)) {

    verified = false;
    status = 400;

    if (type !== "challenge") {
        verificationMsg = msg.VERIFICATION_FAIL_TYPE_CHALLENGE;
    }

    if (!mustWin && (minKills === null) && (maxDeaths === null)) {
        verificationMsg = msg.VERIFICATION_FAIL_CONDITION;
    }

    if ((minKills !== null) && (minKills <= 0)) {
        verificationMsg = msg.VERIFICATION_FAIL_MIN_KILLS;
    }

    if (maxDeaths < 0) {
        verificationMsg = msg.VERIFICATION_FAIL_MAX_DEATHS;
    }

    if (bits <= 0) {
        verificationMsg = msg.VERIFICATION_FAIL_BITS;
    }
  }

  if (verified) {

    // get riot's summoner id (not the displayed name)
    if (summonerName) {
      summonerId = await lolApi.getSummonerId(server, summonerName);
    }

    // retrieve game from riot
    // if it doesn't exist, then challenge will be verfified by default because
    // challenges can be submitted between games
    const game = await lolApi.getGame(server, summonerId);

    // other verifications
    if (!summonerId) {

      verified = false;
      status = 400;
      verificationMsg = msg.VERIFICATION_FAIL_INVALID_SUMMONER;

    } else if (game.gameId) {

      gameStartTime = game.gameStartTime;

      if (game.gameStartTime > 0) {
        gameTimeElapsed = Number(new Date()) - game.gameStartTime;
      }

      if (gameTimeElapsed >= c.GAME_TIME_THRESHOLD) {

        verified = false;
        status = 400;
        verificationMsg = msg.VERIFICATION_FAIL_GAME_LENGTH;
      }
    } else if (game === 429) {

      verified = false;
      status = 429;
      verificationMsg = msg.VERIFICATION_FAIL_DATA_ERROR;
    }
  }

  // if not verified, remove time from requestIds object so that another
  //  submission doesn't count as a dupliucate request
  // (otherwise subsequent requests within 3 minutes would be rejected
  // by the filter)
  if (!verified) {
    delete df.requestIds["/api/verify-challenge"][userId];
  } else {

    // create token for use by this server - when submitted, will need this token
    const tokenParams = {
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      user_id: userId
    };

    verificationToken = jwt.sign(tokenParams, c.SERVER_SECRET);
  }

  const body = {
      verified: verified,
      message: verificationMsg,
      gameTimeElapsed: gameTimeElapsed,
      gameStartTime: gameStartTime,
      userId: userId,
      summonerId: summonerId,
      verificationToken: verificationToken,
      panelMsg: null,
      alertMsg: null,
      chatMsg: null,
      alertSuccess: null,
      chatSuccess: null,

      parameters: {
        type: type,
        mustWin: mustWin,
        minKills: minKills,
        maxDeaths: maxDeaths,
        bits: bits
      }
  };

  if (verified) {

    // construct verification messages
    body.alertSuccess = msg.ALERT_SUCCESS;
    body.chatSuccess = msg.CHAT_SUCCESS;

    const challengeVerificationMsg = createChallengeVerificationMsg(body.parameters);
    const headerMsg = userName + " issued a challenge!";
    const chatMsg = headerMsg + " " + challengeVerificationMsg;

    body.panelMsg = "Challenge issued! " + challengeVerificationMsg;
    body.alertMsg = challengeVerificationMsg;
    body.chatMsg = chatMsg;

    // post stream alert
    if (alertsEnabled && (bits >= Number(minChallengeAlerts))) {

      const slToken = jwt.verify(slAuth, c.SL_CLIENT_SECRET);
      const alertRes = await slApi.postAlert(slToken, headerMsg, challengeVerificationMsg);

      if (alertRes !== 200) {
        body.alertSuccess = msg.ALERT_FAIL;
      }
    }

    // post twitch chat message
    const payload = {
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      channel_id: channelId,
      user_id: c.DEV_ID,
      role: "external"
    };

    const twitchToken = jwt.sign(payload, c.TWITCH_SECRET, { noTimestamp: true });
    const chatRes = await twitchApi.postChatMsg(twitchToken, channelId, chatMsg);

    if (chatRes !== 200) {
      body.chatSuccess = msg.CHAT_FAIL;
    }
  }

  const response = {
      statusCode: status,
      body: body
  };

  console.log(requestDescription + ": " + body.message);
  res.status(status).send(response);
});

module.exports = router;
