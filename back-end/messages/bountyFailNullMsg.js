// construct lost or nullified message for bounties
const createBountyFailNullMsg = (params, bountyNames, lostOrNullified) => {

  let msg = "Bounty " + lostOrNullified + "!";
  msg += " The bounty was";

  let andStr = "";

  if (params.champBounties && params.champBounties.length === 1) {
    andStr = " and";
  }

  if (!params.champBounties && (params.deathPenalty === null))
    msg += " " + params.anyKillBounty + " bits per kill.";
  else if (!params.champBounties)
    msg += " " + params.anyKillBounty + " bits per kill, minus " +
      params.deathPenalty + " bits per death.";
  else {

    if (params.anyKillBounty !== null)
      msg += " " + params.anyKillBounty + " bits per kill," + andStr;

    const len = params.champBounties.length;

    for (let i = 0; i < len; i++) {

      msg += " " + params.champBounties[i].amount + " bits per kill on";
      msg += " " + bountyNames[i];

      if ((i !== len - 1) && (len >= 2))
        msg += ",";
      if (i === len - 2)
        msg += " and ";

      if (i === len - 1) {

        if (!params.deathPenalty) {
          msg += ".";
        } else {
          msg += ", minus " + params.deathPenalty + " bits per death.";
        }
      }
    }
  }

  if (params.mustWin)
    msg += " The bounty could only be collected on a win.";

  return msg;
};

module.exports = createBountyFailNullMsg;
