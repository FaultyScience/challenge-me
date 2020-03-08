const express = require("express");
const jwt = require("jsonwebtoken");

const msg = require("./resources/messages");
const c = require("./resources/constants");
const lolApi = require("./resources/lolApi");
const slApi = require("./resources/slApi");
const twitchApi = require("./resources/twitchApi");
const utils = require("./resources/utils");
const createChallengeAchievementMsg = require("../messages/challengeAchievementMsg");
const createChallengeFailNullMsg = require("../messages/challengeFailNullMsg");
const skuMap = require("../maps/skuMap.json");

const router = express.Router();
const outstandingChallenges = {};

// route to submit challenge after it's been verified
router.post("/submit-challenge", async (req, res) => {

  try {

    let gameTimeElapsed = null;
    let gameStartTime = null;
    let summonerId = null;
    let status = 200;
    let gameAttempts = 0;
    let matchAttempts = 0;
    let currentGameAttempts = 0;
    let currentMatchAttempts = 0;
    let totalAttempts = 0;
    let challengeCount;
    let requestDescription;

    const channelId = req.body.channelId;
    const slAuth = req.body.slAuth;
    const userId = req.body.userId;
    const userName = req.body.userName;
    const summonerName = req.body.summonerId;
    const server = req.body.server;
    const alertsEnabled = req.body.alertsEnabled;
    const minChallengeAlerts = req.body.minChallengeAlerts;
    const type = req.body.type;
    const mustWin = req.body.mustWin;
    const minKills = req.body.minKills;
    const maxDeaths = req.body.maxDeaths;
    const bits = req.body.bits;
    const submissionStartTime = Number(new Date());

    // get riot's summoner id (not the displayed name)
    if (summonerName) {
      summonerId = await lolApi.getSummonerId(server, summonerName);
    }

    let game = null;
    let gameId = null;
    let match = null;

    if (summonerId) {

      // track currently outstanding challenges
      if (outstandingChallenges[userId] === undefined) {
        outstandingChallenges[userId] = {};
      }

      if (outstandingChallenges[userId][summonerName] === undefined) {
        outstandingChallenges[userId][summonerName] = 0;
      }

      outstandingChallenges[userId][summonerName] += 1;
      challengeCount = outstandingChallenges[userId][summonerName];

      requestDescription = userName + "'s challenge #" + challengeCount +
        " for " + summonerName;

      // loop to retrieve game from riot (waiting for game to start)
      while ((!gameId) && (totalAttempts < c.MAX_ATTEMPTS)) {

        gameAttempts += 1;
        currentGameAttempts += 1;
        currentMatchAttempts = 0;
        totalAttempts = gameAttempts + matchAttempts;

        if (status === 503) { break; }

        console.log(requestDescription + ": Get game attempt #" +
          currentGameAttempts + " (" + totalAttempts + " total attempts)");

        try {

          game = await lolApi.timeoutGame(server, summonerId);

          if (utils.isObject(game)) {

            gameId = game.gameId;
            gameTimeElapsed = Number(new Date()) - game.gameStartTime;
          }
        }
        catch (err) {

          if (err === 404) {
            console.log(requestDescription + ": " + msg.GAME_404);
          } else if (err === 400) {
            console.log(requestDescription + ": " + msg.GAME_400);
          } else if (err === 503) {
            console.log(requestDescription + ": " + msg.GAME_503);
          } else if (err === 500) {
            console.log(requestDescription + ": " + msg.GAME_500);
          } else if (err === 502) {
            console.log(requestDescription + ": " + msg.GAME_502);
          } else if (err === 504) {
            console.log(requestDescription + ": " + msg.GAME_504);
          } else if (err === 429) {
            console.log(requestDescription + ": " + msg.GAME_429);
          } else if (err === 478) {

            match = null;
            console.log(requestDescription + ": " + msg.GAME_REMADE);
            break;

          } else if (err === 428) {

            match = null;
            console.log(requestDescription + ": " + msg.APPROACHING_RATE_LIMIT);
            status = 429;
            break;

          } else {

            console.log(requestDescription + ": Error " + err);
            status = err;
            break;
          }
        }

        if (totalAttempts >= c.MAX_ATTEMPTS) {

          status = 404;
          console.log(requestDescription + ": " + msg.MAX_ATTEMPTS_REACHED);
        }

        if (!gameId) { continue; }

        // this is here to prevent cases where viewer submits a challenge
        // after a game completes, but the previous game is still phasing
        // in and out of riot's data stream.
        // if it wasn't here, the challenge results could be returned
        // using the preivous game's data; actually, a nullification would
        // occur, but this prevents a nullification, and makes it possible
        // for a valid challenge completion to occur
        if (gameTimeElapsed >= c.GAME_TIME_THRESHOLD) {

          gameId = null;
          gameTimeElapsed = null;
          continue;
        }

        // loop to retrieve match from riot (waiting for game to complete)
        while (!utils.isObject(match) && (totalAttempts < c.MAX_ATTEMPTS)) {

          matchAttempts += 1;
          currentMatchAttempts += 1;
          totalAttempts = gameAttempts + matchAttempts;

          console.log(requestDescription + ": Get match attempt #" +
            currentMatchAttempts + " (" + totalAttempts + " total attempts)");

          try {
            match = await lolApi.timeoutMatch(server, summonerId, gameId);
          }

          catch (err) {

            if (err === 404) {
              console.log(requestDescription + ": " + msg.MATCH_404);
            } else if (err === 400) {
              console.log(requestDescription + ": " + msg.MATCH_400);
            } else if (err === 503) {
              console.log(requestDescription + ": " + msg.MATCH_503);
            } else if (err === 500) {
              console.log(requestDescription + ": " + msg.MATCH_500);
            } else if (err === 502) {
              console.log(requestDescription + ": " + msg.MATCH_502);
            } else if (err === 504) {
              console.log(requestDescription + ": " + msg.MATCH_504);
            } else if (err === 429) {
              console.log(requestDescription + ": " + msg.MATCH_429);
            } else if (err === 478) {

              match = null;
              game = null;
              gameId = null;
              currentGameAttempts = 0;
              console.log(requestDescription + ": " + msg.GAME_REMADE);
              break;

            } else if (err === 428) {

              match = null;
              game = null;
              gameId = null;
              currentGameAttempts = 0;
              console.log(requestDescription + ": " + msg.APPRACHING_RATE_LIMIT);
              status = 429;
              break;

            } else {

              console.log(requestDescription + ": " + err);
              status = err;
              break;
            }
          }

          if (totalAttempts >= c.MAX_ATTEMPTS) {

            status = 404;
            console.log(requestDescription + ": " + msg.MAX_ATTEMPTS_REACHED);
          }
        }
      }
    } else {

      // if no summoner id available
      requestDescription = userName + "'s challenge submission" +
        " for " + summonerName;
    }

    gameTimeElapsed = gameId ? Number(new Date()) - game.gameStartTime : null;
    const submissionTimeElapsed = Number(new Date()) - submissionStartTime;

    if (summonerId) {

      // decrement currently outstanding challenges
      outstandingChallenges[userId][summonerName] -= 1;

      if (outstandingChallenges[userId][summonerName] === 0) {
        delete outstandingChallenges[userId][summonerName];
      }

      if (Object.keys(outstandingChallenges[userId]).length === 0) {
        delete outstandingChallenges[userId];
      }
    }

    const body = {
      message: msg.CHALLENGE_NONE,
      gameTimeElapsed: gameTimeElapsed,
      gameStartTime: gameId ? game.gameStartTime : null,
      type: type,
      challengeResult: null,
      bitsToSend: 0,
      productSku: null,
      panelMsg: null,
      headerMsg: null,
      alertMsg: null,
      chatMsg: null,
      failMsg: null,
      nullMsg: null,

      parameters: {
        type: type,
        mustWin: mustWin,
        minKills: minKills,
        maxDeaths: maxDeaths,
        bits: bits
      },

      gameResults: null
    };

    // nullify in event that submission time < 3 minutes (something must have gone wrong)
    if (submissionTimeElapsed < c.SUBMISSION_TIME_THESHOLD) {

      body.message = msg.CHALLENGE_NULLIFIED;
      status = 404;
    }

    if (utils.isObject(match) && (submissionTimeElapsed >= c.SUBMISSION_TIME_THESHOLD)) {

      // use match object to populate results and other data
      body.gameTimeElapsed = match.gameDuration;

      const participantId = lolApi.getParticipantId(match, summonerId);
      const gameResults = match.participants[participantId - 1].stats;
      body.gameResults = gameResults;

      let mustWinPassOrNull, minKillsPassOrNull, maxDeathsPassOrNull;
      mustWinPassOrNull = minKillsPassOrNull = maxDeathsPassOrNull = false;

      if (!mustWin || (mustWin && gameResults.win)) {
        mustWinPassOrNull = true;
      }

      if (!minKills || (gameResults.kills >= minKills)) {
        minKillsPassOrNull = true;
      }

      if ((maxDeaths === null) || (gameResults.deaths <= maxDeaths)) {
        maxDeathsPassOrNull = true;
      }

      if (mustWinPassOrNull && minKillsPassOrNull && maxDeathsPassOrNull) {

        body.challengeResult = "win";
        body.bitsToSend = bits;
        body.productSku = skuMap["challenge_" + bits];
        body.message = msg.CHALLENGE_WON;

      } else {

        body.challengeResult = "lose";
        body.message = msg.CHALLENGE_LOST;
        body.failMsg = createChallengeFailNullMsg(body.parameters, "failed");
      }
    }

    if (body.challengeResult === "win") {

      // construct achievement messages
      const challengeAchievementMsg = createChallengeAchievementMsg(body);
      const headerMsg = userName + "'s challenge achieved!";
      const chatMsg = headerMsg + " " + challengeAchievementMsg;

      body.panelMsg = challengeAchievementMsg;
      body.headerMsg = headerMsg;
      body.alertMsg = challengeAchievementMsg;
      body.chatMsg = chatMsg;

    } else if (body.challengeResult === null) {
      body.nullMsg = createChallengeFailNullMsg(body.parameters, "nullified");
    }

    const response = {
      statusCode: status,
      body: body
    };

    console.log(requestDescription + ": Response sent");
    res.status(status).send(response);
  }

  catch(err) {
    console.log(err);
  }
});

module.exports = router;
