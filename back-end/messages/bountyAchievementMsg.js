// construct achievement message for bounties
const createBountyAchievementMsg = res => {

  let achievementMsg = res.bitsToSend + " bounty bits awarded! Game ";

  achievementMsg += res.parameters.mustWin ? "won" : "completed";

  let killStr = "kills";
  if (res.gameResults.kills === 1) { killStr = "kill"; }

  let deathStr = "deaths";
  if (res.gameResults.deaths === 1) { deathStr = "death"; }

  let andStr = "";

  if (res.parameters.champBounties
    && res.parameters.champBounties.length === 1) {
    andStr = "and ";
  }

  if (!res.parameters.champBounties
    && (res.parameters.deathPenalty === null))

    achievementMsg += " with " + res.gameResults.kills + " "
      + killStr + "!";

  else if (!res.parameters.champBounties)

    achievementMsg += " with " + res.gameResults.kills + " " + killStr
      + " and " + res.gameResults.deaths + " " + deathStr + "!";

  else {

    if ((res.parameters.anyKillBounty === null) &&
        (res.parameters.deathPenalty === null))
      achievementMsg += " with ";
    else if (res.parameters.deathPenalty === null)

      achievementMsg += " with " + res.gameResults.kills + " total " +
        killStr + ", " + andStr;

    else if (res.parameters.anyKillBounty === null)

      achievementMsg += " with " + res.gameResults.deaths + " " +
        deathStr + ", " + andStr;

    else
      achievementMsg += " with " + res.gameResults.kills + " total " +
        killStr + ", " + res.gameResults.deaths + " " + deathStr +
        ", " + andStr;

    const len = res.parameters.champBounties.length;
    let champKills;

    for (let i = 0; i < len; i++) {

      let champKillName = res.parameters.champBounties[i].name.toUpperCase();

      if (champKillName === "NUNU") { champKillName = "NUNU & WILLUMP"; }

      champKills = res.killBreakdown[champKillName];

      killStr = "kills";
      if (champKills === 1) { killStr = "kill"; }

      achievementMsg += champKills + " " + killStr + " on " +
        res.bountyNames[i];

      if ((i !== len - 1) && (len >= 2))
        achievementMsg += ", ";
      if (i === len - 2)
        achievementMsg += " and ";
      if (i === len - 1)
        achievementMsg += "!";
    }
  }

  return achievementMsg;
};

module.exports = createBountyAchievementMsg;
