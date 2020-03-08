// construct failed or nullified message for challenges
const createChallengeFailNullMsg = (params, failedOrNullified) => {

  let msg = "Challenge for " + params.bits + " bits " + failedOrNullified + "!";
  msg += " The challenge was to ";
  msg += params.mustWin ? "win" : "complete";
  msg += " this game";

  let killStr = "kills";
  if (params.minKills === 1) { killStr = "kill"; }

  let deathStr = "deaths";
  if (params.maxDeaths === 1) { deathStr = "death"; }

  if ((params.minKills === null) && (params.maxDeaths === null))
    msg += ".";
  else if (params.maxDeaths === null)
    msg += " with at least " + params.minKills + " " + killStr + ".";
  else if (params.minKills === null)

    if (params.maxDeaths !== 0) {
      msg += " with at most " + params.maxDeaths + " " + deathStr + ".";
    } else {
      msg += " with no deaths.";
    }

  else {

    msg += " with at least " + params.minKills + " " + killStr;

    if (params.maxDeaths !== 0) {
      msg += " and at most " + params.maxDeaths + " " + deathStr + ".";
    } else {
      msg += " and no deaths.";
    }
  }

  return msg;
};

module.exports = createChallengeFailNullMsg;
