const express = require("express");
const jwt = require("jsonwebtoken");

const msg = require("./resources/messages");
const c = require("./resources/constants");
const lolApi = require("./resources/lolApi");
const slApi = require("./resources/slApi");
const twitchApi = require("./resources/twitchApi");
const utils = require("./resources/utils");
const createBountyAchievementMsg = require("../messages/bountyAchievementMsg");
const createBountyFailNullMsg = require("../messages/bountyFailNullMsg");
const skuMap = require("../maps/skuMap.json");

const router = express.Router();
const outstandingBounties = {};

// route to submit bounty after it's been verified
router.post("/submit-bounty", async (req, res) => {

  try {

    const idToChampMap = require("../maps/idToChampMap.json");

    let gameTimeElapsed = null;
    let gameStartTime = req.body.gameStartTime;
    let summonerId = null;
    let status = 200;
    let matchAttempts = 0;
    let bountyCount;
    let requestDescription;

    const channelId = req.body.channelId;
    const slAuth = req.body.slAuth;
    const userId = req.body.userId;
    const userName = req.body.userName;
    const summonerName = req.body.summonerId;
    const server = req.body.server;
    const alertsEnabled = req.body.alertsEnabled;
    const minBountyAlerts = req.body.minBountyAlerts;
    const type = req.body.type;
    const mustWin = req.body.mustWin;
    const anyKillBounty = req.body.anyKillBounty;
    const champBounties = req.body.champBounties;
    const deathPenalty = req.body.deathPenalty;
    const gameId = req.body.gameId;
    const bountyNames = req.body.bountyNames;
    const submissionStartTime = Number(new Date());

    // get riot's summoner id (not the displayed name)
    if (summonerName) {
      summonerId = await lolApi.getSummonerId(server, summonerName);
    }

    let match = null;

    if (summonerId) {

      // track currently outstanding bounties
      if (outstandingBounties[userId] === undefined) {
        outstandingBounties[userId] = {};
      }

      if (outstandingBounties[userId][summonerName] === undefined) {
        outstandingBounties[userId][summonerName] = 0;
      }

      outstandingBounties[userId][summonerName] += 1;
      bountyCount = outstandingBounties[userId][summonerName];

      requestDescription = userName + "'s bounty #" + bountyCount + " for " +
        summonerName;

      // loop to retrieve match from riot (waiting for game to complete)
      while (!utils.isObject(match) && (matchAttempts < c.MAX_ATTEMPTS)) {

        matchAttempts += 1;

        console.log(requestDescription + ": Get match attempt #" +
          matchAttempts);

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

        if (matchAttempts >= c.MAX_ATTEMPTS) {

          status = 404;
          console.log(requestDescription + ": " + msg.MAX_ATTEMPTS_REACHED);
        }
      }
    } else {

      // if no summoner id available
      requestDescription = userName + "'s bounty submission" +
        " for " + summonerName;
    }

    const submissionTimeElapsed = Number(new Date()) - submissionStartTime;

    const body = {
      message: msg.BOUNTY_NONE,
      gameTimeElapsed: Number(new Date()) - gameStartTime,
      gameStartTime: gameStartTime,
      type: type,
      bountyResult: null,
      bountyNames: bountyNames,
      killBreakdown: null,
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
        anyKillBounty: anyKillBounty,
        champBounties: champBounties,
        deathPenalty: deathPenalty
      },

      gameResults: null
    };

    // nullify in event that submission time < 3 minutes (something must have gone wrong)
    if (submissionTimeElapsed < c.SUBMISSION_TIME_THESHOLD) {

      body.message = msg.BOUNTY_NULLIFIED;
      status = 404;
    }

    if (utils.isObject(match) && (submissionTimeElapsed >= c.SUBMISSION_TIME_THESHOLD)) {

      // use match object to populate results and other data
      body.gameTimeElapsed = match.gameDuration;

      const participantId = lolApi.getParticipantId(match, summonerId);
      const gameResults = match.participants[participantId - 1].stats;
      body.gameResults = gameResults;

      let mustWinPassOrNull;
      mustWinPassOrNull = false;

      if (!mustWin || (mustWin && gameResults.win)) {
        mustWinPassOrNull = true;
      }

      if (mustWinPassOrNull && anyKillBounty) {
        body.bitsToSend += anyKillBounty * gameResults.kills;
      }

      if (mustWinPassOrNull && champBounties) {

        let timeline = null;
        let timelineAttempts = 0;

        // loop to get timeline from riot
        // (after game is done, waiting for timeline to be compiled)
        while (!utils.isObject(timeline)
          && (timelineAttempts < c.MAX_TIMELINE_ATTEMPTS)) {

          timelineAttempts += 1;

          console.log(requestDescription + ": Get timeline attempt #" +
            timelineAttempts);

          try {
            timeline = await lolApi.timeoutTimeline(server, gameId);
          }

          catch (err) {

            if (err === 404) {
              console.log(requestDescription + ": " + msg.TIMELINE_404);
            } else if (err === 400) {
              console.log(requestDescription + ": " + msg.TIMELINE_400);
            } else if (err === 500) {
              console.log(requestDescription + ": " + msg.TIMELINE_500);
            } else if (err === 502) {
              console.log(requestDescription + ": " + msg.TIMELINE_502);
            } else if (err === 503) {
              console.log(requestDescription + ": " + msg.TIMELINE_503);
            } else if (err === 504) {
              console.log(requestDescription + ": " + msg.TIMELINE_504);
            } else if (err === 429) {
              console.log(requestDescription + ": " + msg.TIMELINE_429);
            } else if (err === 428) {

              console.log(requestDescription + ": " + msg.APPROACHING_RATE_LIMIT);
              status = 429;
              break;

            } else {

              console.log(requestDescription + ": " + err);
              status = err;
              break;
            }
          }
        }

        if (utils.isObject(timeline)) {

          // use timeline object to populate results and other data
          const homeTeamId = match.participants[participantId - 1].teamId;
          const enemyTeamId = (homeTeamId === 100) ? 200 : 100;
          const enemyChamps = [];
          const participantIdToNameMap = {};

          for (let participant of match.participants) {

            if (participant.teamId === enemyTeamId) {

              let champName = idToChampMap[String(participant.championId)];

              enemyChamps.push(champName);
              participantIdToNameMap[participant.participantId] = champName;
            }
          }

          const killBreakdown = lolApi.getKillBreakdown(timeline, participantId,
            enemyChamps, participantIdToNameMap);

          for (let champBounty of champBounties) {

            let champKillName = champBounty.name.toUpperCase();

            if (champKillName === "NUNU") { champKillName = "NUNU & WILLUMP"; }

            let champKills = killBreakdown[champKillName];
            body.bitsToSend += champBounty.amount * champKills;
          }

          body.killBreakdown = killBreakdown;
        }
      }

      if (deathPenalty) {
        body.bitsToSend -= deathPenalty * gameResults.deaths;
      }

      if (mustWinPassOrNull && (body.bitsToSend > 0)) {

        body.bountyResult = "win";
        body.message = msg.BOUNTY_WON;
        body.productSku = skuMap["bounty_" + body.bitsToSend];

      } else {

        body.bountyResult = "lose";
        body.message = msg.BOUNTY_LOST;
        body.failMsg = createBountyFailNullMsg(body.parameters, body.bountyNames, "lost");
      }

      if (body.bitsToSend < 0) { body.bitsToSend = 0; }
    }

    if (summonerId) {

      // decrement currently outstanding bounties
      outstandingBounties[userId][summonerName] -= 1;

      if (outstandingBounties[userId][summonerName] === 0) {
        delete outstandingBounties[userId][summonerName];
      }

      if (Object.keys(outstandingBounties[userId]).length === 0) {
        delete outstandingBounties[userId];
      }
    }

    if (body.bountyResult === "win") {

      // construct achievement messages
      const bountyPerKillSumTotal = utils.calcPerKillSumTotal(anyKillBounty, champBounties);
      const bountyAchievementMsg = createBountyAchievementMsg(body);
      const headerMsg = userName + "'s bounty collected!";
      const chatMsg = headerMsg + " " + bountyAchievementMsg;

      body.panelMsg = bountyAchievementMsg;
      body.headerMsg = headerMsg;
      body.alertMsg = bountyAchievementMsg;
      body.chatMsg = chatMsg;

    } else if (body.bountyResult === null) {
      body.nullMsg = createBountyFailNullMsg(body.parameters, body.bountyNames, "nullified");
    }

    const response = {
        statusCode: status,
        body: body
    };

    console.log(requestDescription + ": Response sent");
    res.status(status).send(response);
  }

  catch (err) {
    console.log(err);
  }
});

module.exports = router;
