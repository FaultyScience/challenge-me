// construct initial verification message for bounties
const createBountyVerificationMsg = resData => {

  let msg;

  if (resData.mustWin) {
    msg = "If this game is a win,";
  } else {
    msg = "Win or lose this game,";
  }

  let andStr = "";

  if (resData.champBounties && resData.champBounties.length === 1) {
    andStr = " and";
  }

  if (!resData.champBounties && (resData.deathPenalty === null))
    msg += " " + resData.anyKillBounty + " bits per kill!";
  else if (!resData.champBounties)
    msg += " " + resData.anyKillBounty + " bits per kill, minus " +
      resData.deathPenalty + " bits per death!";
  else {

    if (resData.anyKillBounty !== null)
      msg += " " + resData.anyKillBounty + " bits per kill," + andStr;

    const len = resData.champBounties.length;

    for (let i = 0; i < len; i++) {

      msg += " " + resData.champBounties[i].amount + " bits per kill on";
      msg += " " + resData.bountyNames[i];

      if ((i !== len - 1) && (len >= 2))
        msg += ",";
      if (i === len - 2)
        msg += " and ";

      if (i === len - 1) {

        if (!resData.deathPenalty) {
          msg += "!";
        } else {
          msg += ", minus " + resData.deathPenalty + " bits per death!";
        }
      }
    }
  }

  return msg;
};

module.exports = createBountyVerificationMsg;
