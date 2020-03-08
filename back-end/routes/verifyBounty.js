const express = require("express");
const jwt = require("jsonwebtoken");

const df = require("../filter/duplicateFilter");
const msg = require("./resources/messages");
const c = require("./resources/constants");
const lolApi = require("./resources/lolApi");
const slApi = require("./resources/slApi");
const twitchApi = require("./resources/twitchApi");
const utils = require("./resources/utils");
const createBountyVerificationMsg = require("../messages/bountyVerificationMsg");

const router = express.Router();

// route to verify bounty
router.post("/verify-bounty", async (req, res) => {

  const champToIdMap = require("../maps/champToIdMap.json");
  const idToPrintChampMap = require("../maps/idToPrintChampMap.json");

  let verified = true;
  let verificationMsg = msg.VERIFICATION_SUCCESS;
  let namesPopulated = true;
  let gameTimeElapsed = null;
  let gameStartTime = null;
  let summonerId = null;
  let enemyChampIds = null;
  let bountyNames = null;
  let unverifiedNames = [];
  let unverifiedIndices = [];
  let gameId = null;
  let verificationToken = null;
  let status = 200;

  const channelId = req.body.channelId;
  const slAuth = req.body.slAuth;
  const server = req.body.server;
  const alertsEnabled = req.body.alertsEnabled;
  const minBountyAlerts = req.body.minBountyAlerts;
  const userId = req.body.userId;
  const userName = req.body.userName;
  const summonerName = req.body.summonerId;
  const champNames = req.body.champNames;
  const type = req.body.type;
  const mustWin = req.body.mustWin;
  const anyKillBounty = req.body.anyKillBounty;
  const indices = req.body.indices;
  const champBounties = req.body.champBounties;
  const deathPenalty = req.body.deathPenalty;

  const requestDescription = userName + "'s bounty submission for "
    + summonerName;

  // initial verification that should have been verified on front-end
  if ((type !== "bounty")
    || (!anyKillBounty && !champBounties)
    || ((anyKillBounty !== null) && (anyKillBounty <= 0))
    || ((deathPenalty !== null) && (deathPenalty <= 0))
    || ((champBounties !== null) && utils.containsZeroOrNeg(champBounties))) {

    verified = false;
    status = 400;

    if (type !== "bounty") {
        verificationMsg = msg.VERIFICATION_FAIL_TYPE_BOUNTY;
    }

    if (!anyKillBounty && !champBounties) {
        verificationMsg = msg.VERIFICATION_FAIL_NO_BOUNTIES;
    }

    if ((anyKillBounty !== null) && (anyKillBounty <= 0)) {
        verificationMsg = msg.VERIFICATION_FAIL_ANY_KILL_BOUNTY;
    }

    if ((deathPenalty !== null) && (deathPenalty <= 0)) {
        verificationMsg = msg.VERIFICATION_FAIL_DEATH_PENALTY;
    }

    if ((champBounties !== null) && utils.containsZeroOrNeg(champBounties)) {
        verificationMsg = msg.VERIFICATION_FAIL_CHAMP_BOUNTIES;
    }
  }

  if (verified) {

    // get riot's summoner id (not the displayed name)
    if (summonerName) {
      summonerId = await lolApi.getSummonerId(server, summonerName);
    }

    // retrieve game from riot
    // if it doesn't exist, then bounty isn't verfified because
    // game must be live for bounties
    const game = await lolApi.getGame(server, summonerId);
    gameId = game.gameId;

    // other verifications
    if (!summonerId) {

      verified = false;
      status = 400;
      verificationMsg = msg.VERIFICATION_FAIL_INVALID_SUMMONER;

    } else if (!gameId) {

      verified = false;

      if (game === 429) {

        status = 429;
        verificationMsg = msg.VERIFICATION_FAIL_DATA_ERROR;
        
      } else {

        status = 400;
        verificationMsg = msg.VERIFICATION_FAIL_GAME_NOT_LIVE;
      }
    } else {

      gameStartTime = game.gameStartTime;

      if (game.gameStartTime > 0) {
        gameTimeElapsed = Number(new Date()) - game.gameStartTime;
      }

      if (gameTimeElapsed >= c.GAME_TIME_THRESHOLD) {

          verified = false;
          status = 400;
          verificationMsg = msg.VERIFICATION_FAIL_GAME_LENGTH;

      } else {

        // verify that enemy champ names were populated
        for (let champName of champNames) {

          if (champName === c.DEFAULT_NAME) {

            verified = false;
            status = 400;
            verificationMsg = msg.VERIFICATION_FAIL_CHAMP_NAMES_NOT_POPULATED;
            namesPopulated = false;
            break;
          }
        }

        if (namesPopulated) {

          enemyChampIds = [];
          let homeTeamId, enemyTeamId;

          for (let participant of game.participants) {

            if (participant.summonerId === summonerId) {
              homeTeamId = participant.teamId;
            }
          }

          enemyTeamId = (homeTeamId === 100) ? 200 : 100;

          for (let participant of game.participants) {

            if (participant.teamId === enemyTeamId) {
              enemyChampIds.push(participant.championId);
            }
          }

          if (champBounties) {

            for (let champName of champNames) {

              let champNameCaps = champName.toUpperCase();

              // replace nunu - many won't know that official name is nunu & willump
              if (champNameCaps === "NUNU") {
                champNameCaps = "NUNU & WILLUMP";
              }

              let champId = champToIdMap[champNameCaps];

              if (!enemyChampIds.includes(champId)) {

                verified = false;
                status = 400;
                verificationMsg = msg.VERIFICATION_FAIL_CHAMP_NAME_MISMATCH;
                break;
              }
            }
          }

          let indicesLength = 0;

          if (indices) {

            indicesLength = indices.length;
            bountyNames = [];
          }

          for (let i = 0; i < indicesLength; i++) {

            let index = indices[i];
            let champName = champBounties[i].name;
            let champNameCaps = champName.toUpperCase();

            // replace nunu - many won't know that official name is nunu & willump
            if (champNameCaps === "NUNU") {
              champNameCaps = "NUNU & WILLUMP";
            }

            let champId = champToIdMap[champNameCaps];

            if (!enemyChampIds.includes(champId)) {

              verified = false;
              status = 400;
              verificationMsg = msg.VERIFICATION_FAIL_CHAMP_NAME_MISMATCH;

              unverifiedNames.push(champName);
              unverifiedIndices.push(index);

            } else {

              let printName = idToPrintChampMap[String(champId)];

              if (printName === "Nunu & Willump") { printName = "Nunu"; }

              bountyNames.push(printName);
            }
          }
        }
      }
    }
  }

  // if not verified, remove time from requestIds object so that another
  //  submission doesn't count as a dupliucate request
  // (otherwise subsequent requests within 3 minutes would be rejected
  // by the filter)
  if (!verified) {
    delete df.requestIds["/api/verify-bounty"][userId];
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
      summonerId: summonerId,
      champNames: champNames,
      enemyChampIds: enemyChampIds,
      bountyNames: bountyNames,
      unverifiedNames: !utils.isEmpty(unverifiedNames) ? unverifiedNames : null,
      unverifiedIndices: !utils.isEmpty(unverifiedIndices) ? unverifiedIndices : null,
      gameId: gameId,
      verificationToken: verificationToken,
      panelMsg: null,
      alertMsg: null,
      chatMsg: null,
      alertSuccess: null,
      chatSuccess: null,

      parameters: {
          type: type,
          mustWin: mustWin,
          anyKillBounty: anyKillBounty,
          indices: indices,
          champBounties: champBounties,
          bountyNames: bountyNames,
          deathPenalty: deathPenalty
      }
  };

  if (verified) {

    // calc sum of any kill bounty + bounty for each champ to determine
    // whether it surpasses the minBountyAlert config set by streamer
    const bountyPerKillSumTotal = utils.calcPerKillSumTotal(anyKillBounty, champBounties);

    // construct verification messages
    body.alertSuccess = msg.ALERT_SUCCESS;
    body.chatSuccess = msg.CHAT_SUCCESS;

    const bountyVerificationMsg = createBountyVerificationMsg(body.parameters);
    const headerMsg = userName + " set a bounty!";
    const chatMsg = headerMsg + " " + bountyVerificationMsg;

    body.panelMsg = "Bounty set! " + bountyVerificationMsg;
    body.alertMsg = bountyVerificationMsg;
    body.chatMsg = chatMsg;

    // post stream alert
    if (alertsEnabled && (bountyPerKillSumTotal >= minBountyAlerts)) {

      const slToken = jwt.verify(slAuth, c.SL_CLIENT_SECRET);
      const alertRes = await slApi.postAlert(slToken, headerMsg, bountyVerificationMsg);

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
