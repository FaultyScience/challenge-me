const axios = require("axios");
const msg = require("./messages");

const c = require("./constants");
const utils = require("./utils");

// methods to get data from riot api

function isApproachingRateLimits(headers) {

  const appRateLimitCount = headers["x-app-rate-limit-count"].split(",");
  const appRateLimitCount10 = Number(appRateLimitCount[0].split(":")[0]);
  const appRateLimitCount600 = Number(appRateLimitCount[1].split(":")[0]);

  const appRateLimit = headers["x-app-rate-limit"].split(",");
  const appRateLimit10 = Number(appRateLimit[0].split(":")[0]);
  const appRateLimit600 = Number(appRateLimit[1].split(":")[0]);

  const appSoftCap10 = appRateLimit10 * 0.98;
  const appSoftCap600 = appRateLimit600 * 0.98;

  const methodRateLimitCount = headers["x-method-rate-limit-count"].split(",");
  const methodRateLimitCount10 = Number(methodRateLimitCount[0].split(":")[0]);

  let methodRateLimitCount600;

  if (methodRateLimitCount.length > 1) {
    methodRateLimitCount600 = Number(methodRateLimitCount[1].split(":")[0]);
  }

  const methodRateLimit = headers["x-method-rate-limit"].split(",");
  const methodRateLimit10 = Number(methodRateLimit[0].split(":")[0]);

  const methodSoftCap10 = methodRateLimit10 * 0.98;

  let methodRateLimit600, methodSoftCap600;

  if (methodRateLimit.length > 1) {

    methodRateLimit600 = Number(methodRateLimit[1].split(":")[0]);
    methodSoftCap600 = methodRateLimit600 * 0.98;
  }

  if (appRateLimitCount10 > appSoftCap10) {

    console.log("Approaching app rate limit 10s: " + appRateLimitCount10
      + " of " + appRateLimit10);

    return true;
  }

  if (appRateLimitCount600 > appSoftCap600) {

    console.log("Approaching app rate limit 600s: " + appRateLimitCount600
      + " of " + appRateLimit600);

    return true;
  }

  if (methodRateLimitCount10 > methodSoftCap10) {

    console.log("Approaching method rate limit 10s: " + methodRateLimitCount10
      + " of " + methodRateLimit10);

    return true;
  }

  if (methodRateLimit.length > 1) {

    if (methodRateLimitCount10 > methodSoftCap10) {

      console.log("Approaching method rate limit 600s: "
        + methodRateLimitCount600 + " of " + methodRateLimit600);

      return true;
    }
  }

  return false;
}

async function getSummonerId(server, name) {

  try {

    const baseUrl = "https://" + server.toLowerCase() + ".api.riotgames.com/";
    const url = baseUrl + c.SUMMONER_ID_URL + name + c.QUERY_PARAMS;

    const res = await axios.get(url);

    return res.data.id;
  }

  catch (err) {

    console.log("Error:", err.message);
    return false;
  }
}

async function getGame(server, summonerId) {

    try {

      const baseUrl = "https://" + server.toLowerCase() + ".api.riotgames.com/";
      const url = baseUrl + c.GAME_URL + summonerId + c.QUERY_PARAMS;

      const res = await axios.get(url);

      if (isApproachingRateLimits(res.headers))
        throw new Error(428, msg.APPROACHING_RATE_LIMIT);

      return res.data;
    }
    catch (err) {

      if (err.response.status !== 428) {

        if (isApproachingRateLimits(err.response.headers))
          return new Error(428, msg.APPROACHING_RATE_LIMIT);
      }

      return err;
    }
}

async function getMatch(server, gameId) {

    try {

      const baseUrl = "https://" + server.toLowerCase() + ".api.riotgames.com/";
      const url = baseUrl + c.MATCH_URL + gameId + c.QUERY_PARAMS;

      const res = await axios.get(url);

      if (isApproachingRateLimits(res.headers))
        throw new Error(428, msg.APPROACHING_RATE_LIMIT);

      return res.data;
    }

    catch (err) {

      if (err.response.status !== 428) {

        if (isApproachingRateLimits(err.response.headers))
          return new Error(428, msg.APPROACHING_RATE_LIMIT);
      }

      return err;
    }
}

async function getTimeline(server, matchId) {

    try {

      const baseUrl = "https://" + server.toLowerCase() + ".api.riotgames.com/";
      const url = baseUrl + c.TIMELINE_URL + matchId + c.QUERY_PARAMS;

      const res = await axios.get(url);

      if (isApproachingRateLimits(res.headers))
        throw new Error(428, msg.APPROACHING_RATE_LIMIT);

      return res.data;
    }

    catch (err) {

      if (err.response.status !== 428) {

        if (isApproachingRateLimits(err.response.headers))
          return new Error(428, msg.APPROACHING_RATE_LIMIT);
      }

      return err;
    }
}

// returns a digit from 1 to 10
function getParticipantId(match, summonerId) {

  for (let i = 0; i < 10; i++) {

    if (summonerId === match.participantIdentities[i].player.summonerId)
      return i + 1;
  }

  return null;
}

// returns promise that wraps a timeout for getGame()
function timeoutGame(server, summonerId) {

    return new Promise((resolve, reject) => setTimeout(async () => {

        try {

          let game = await getGame(server, summonerId);

          if (!utils.isObject(game)) { reject("Game 404: unknown object"); }

          if (game.response) {

            if (c.ERROR_CODES.includes(game.response.status)) {
              reject(game.response.status);
            }
          }

          if (game.gameId) {
            resolve(game);
          } else {
            reject("Game 404: unknown object");
          }
        }
        catch (err) {

          console.log(err);
          reject(err);
        }

    }, 10000));
}

// returns promise that wraps a timeout for getMatch()
function timeoutMatch(server, summonerId, gameId) {

    return new Promise((resolve, reject) => setTimeout(async () => {

        try {

          let game = await getGame(server, summonerId);

          if (!game.message && utils.isObject(game) &&
              (game.gameId !== gameId)) {
            reject(478);
          }

          let match = await getMatch(server, gameId);

          if (!utils.isObject(match)) { reject("Match 404: unknown object"); }

          if (match.response) {

            if (c.ERROR_CODES.includes(match.response.status)) {
              reject(match.response.status);
            }
          }

          if (match.gameId) {
            resolve(match);
          } else {
            reject("Match 404: unknown object");
          }
        }

        catch (err) {

          console.log(err);
          reject(err);
        }

    }, 10000));
}

// returns promise that wraps a timeout for getTimeline()
function timeoutTimeline(server, matchId) {

    return new Promise((resolve, reject) => setTimeout(async () => {

        try {

          let timeline = await getTimeline(server, matchId);

          if (!utils.isObject(timeline)) { reject("Timeline 404: unknown object"); }

          if (timeline.response) {

            if (c.ERROR_CODES.includes(timeline.response.status)) {
              reject(timeline.response.status);
            }
          }

          if (timeline.frames) {
            resolve(timeline);
          } else {
            reject("Timeline 404: unknown object");
          }
        }

        catch (err) {

          console.log(err);
          reject(err);
        }

    }, 10000));
}

// use timeline object to return number of kills on each enemy
function getKillBreakdown(timeline, participantId, enemyChamps,
  participantIdToNameMap) {

  let kills = {};

  for (let champ of enemyChamps) {
    kills[champ] = 0;
  }

  const frames = timeline.frames;

  for (let frame of frames) {

    let events = frame.events;

    for (let evnt of events) {

      if ((evnt.type === "CHAMPION_KILL") &&
        (evnt.killerId === participantId)) {
        kills[participantIdToNameMap[evnt.victimId]] += 1;
      }
    }
  }

  return kills;
}

module.exports = {
  getSummonerId: getSummonerId,
  getGame: getGame,
  getMatch: getMatch,
  getParticipantId: getParticipantId,
  timeoutGame: timeoutGame,
  timeoutMatch: timeoutMatch,
  getTimeline: getTimeline,
  timeoutTimeline: timeoutTimeline,
  getKillBreakdown: getKillBreakdown
};
