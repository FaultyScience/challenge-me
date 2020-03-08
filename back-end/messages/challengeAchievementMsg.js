// construct achievement message for challenges
const createChallengeAchievementMsg = res => {

  let achievementMsg = res.bitsToSend + " challenge bits awarded! Game ";

  achievementMsg += res.parameters.mustWin ? "won" : "completed";

  let killStr = "kills";
  if (res.gameResults.kills === 1) { killStr = "kill"; }

  let deathStr = "deaths";
  if (res.gameResults.deaths === 1) { deathStr = "death"; }

  if ((res.parameters.minKills === null) && (res.parameters.maxDeaths === null))
    achievementMsg += "!";
  else if (res.parameters.maxDeaths === null)
    achievementMsg += " with " + res.gameResults.kills + " " + killStr + "!";
  else if (res.parameters.minKills === null)
    achievementMsg += " with " + res.gameResults.deaths + " " + deathStr + "!";
  else {
    achievementMsg += " with " + res.gameResults.kills + " " + killStr +
      " and " + res.gameResults.deaths + " " + deathStr + "!";
  }

  return achievementMsg;
};

module.exports = createChallengeAchievementMsg;
