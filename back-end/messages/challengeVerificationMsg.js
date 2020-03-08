// construct initial verification message for challenges
const createChallengeVerificationMsg = resData => {

  let msg = resData.bits + " bits to ";
  msg += resData.mustWin ? "win" : "complete";
  msg += " this game";

  let killStr = "kills";
  if (resData.minKills === 1) { killStr = "kill"; }

  let deathStr = "deaths";
  if (resData.maxDeaths === 1) { deathStr = "death"; }

  if ((resData.minKills === null) && (resData.maxDeaths === null))
    msg += "!";
  else if (resData.maxDeaths === null)
    msg += " with at least " + resData.minKills + " " + killStr + "!";
  else if (resData.minKills === null)

    if (resData.maxDeaths !== 0) {
      msg += " with at most " + resData.maxDeaths + " " + deathStr + "!";
    } else {
      msg += " with no deaths!";
    }

  else {

    msg += " with at least " + resData.minKills + " " + killStr;

    if (resData.maxDeaths !== 0) {
      msg += " and at most " + resData.maxDeaths + " " + deathStr + "!";
    } else {
      msg += " and no deaths!";
    }
  }

  return msg;
};

module.exports = createChallengeVerificationMsg;
