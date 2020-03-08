const express = require("express");
const jwt = require("jsonwebtoken");

const msg = require("./resources/messages");
const c = require("./resources/constants");
const lolApi = require("./resources/lolApi");
const utils = require("./resources/utils");

const router = express.Router();

// route to get enemy champ names
router.post("/get-enemy-champs", async (req, res) => {

  const idToPrintChampMap = require("../maps/idToPrintChampMap.json");

  let getEnemyChampsMsg = msg.GET_ENEMY_CHAMPS_SUCCESS;
  let summonerId = null;
  let enemyChampIds = null;
  let enemyChampNames = [];
  let gameId = null;
  let status = 200;

  const channelId = req.body.channelId;
  const server = req.body.server;
  const userId = req.body.userId;
  const userName = req.body.userName;
  const summonerName = req.body.summonerId;

  const requestDescription = userName
    + "'s request to get enemy champ names for " + summonerName;

  // get riot's summoner id (not the displayed name)
  if (summonerName) {
    summonerId = await lolApi.getSummonerId(server, summonerName);
  }

  // retrieve game from riot
  // if it doesn't exist, then request fails because
  // game must be live or loading to get champ names
  const game = await lolApi.getGame(server, summonerId);
  gameId = game.gameId;

  // other verifications
  if (!summonerId) {

    status = 400;
    getEnemyChampsMsg = msg.VERIFICATION_FAIL_INVALID_SUMMONER;

  } else if (!gameId) {

    if (game === 429) {

      status = 429;
      getEnemyChampsMsg = msg.GET_ENEMY_CHAMPS_FAIL_DATA_ERROR;

    } else {

      status = 400;
      getEnemyChampsMsg = msg.GET_ENEMY_CHAMPS_FAIL_GAME_NOT_LIVE;
    }
  } else {

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

    for (let enemyChampId of enemyChampIds) {

      let champName = idToPrintChampMap[String(enemyChampId)];

      // replace nunu
      if (champName === "Nunu & Willump") {
        champName = "Nunu";
      }

      enemyChampNames.push(champName);
    }
  }

  const body = {
      message: getEnemyChampsMsg,
      summonerId: summonerId,
      enemyChampIds: enemyChampIds,
      enemyChampNames: !utils.isEmpty(enemyChampNames) ? enemyChampNames : null,
      gameId: gameId
  };

  const response = {
      statusCode: status,
      body: body
  };

  console.log(requestDescription + ": " + body.message);
  res.status(status).send(response);
});

module.exports = router;
