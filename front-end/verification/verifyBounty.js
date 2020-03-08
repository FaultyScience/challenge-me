// verify bounty locally before server verification
const verifyBounty = async () => {

  // get config first
  const data = {
    token: ti.token,
    channelId: ti.channelId
  };

  try {

    ti.activeRequests += 1;
    res = await $.ajax(request.createGetConfigRequest(JSON.stringify(data)));
    ti.activeRequests -= 1;
  }
  catch (err) {

    console.log(err);
    return { valid: false, data: {} };
  }

  SL_AUTH = res.body.slAuth;
  SERVER = res.body.server;
  SUMMONER_ID = res.body.summonerId;
  MIN_CHALLENGE_BITS = res.body.minChallengeBits;
  MAX_KILLS = res.body.maxKills;
  MIN_DEATHS = res.body.minDeaths;
  MIN_BOUNTY_BITS = res.body.minBountyBits;
  MAX_DEATH_PENALTY = res.body.maxDeathPenalty;
  ALERT_TOGGLE = res.body.alertToggle;
  MIN_CHALLENGE_ALERTS = res.body.minChallengeAlerts;
  MIN_BOUNTY_ALERTS = res.body.minBountyAlerts;

  let result = {
    valid: true,
    data: {}
  };

  // check if request cap has been reached
  if (ti.activeRequests >= 5) {

    result.valid = false;

    const msg = "Cap reached: you cannot have more than five challenges \
      and/or bounties active at any given time.";

    ui.displayInvalid(msg, "");

    return result;
  }

  const winCondition = $("#bounty_win input").prop("checked");
  const anyKillCondition = $("#bounty_kills input[type='checkbox']")
    .prop("checked");
  const deathCondition = $("#bounty_deaths input[type='checkbox']")
    .prop("checked");
  let indices = [];
  let champNames = [];
  let champBounties = [];

  let anyKillBounty = anyKillCondition ? $("#bounty_kills select").val() : 0;
  let deathPenalty = deathCondition ? $("#bounty_deaths select").val() : 0;

  // check if config was retrieved
  if (MIN_BOUNTY_BITS === null) {

    result.valid = false;

    const msg = "Configuration was not retrieved.";

    const msg2 = "The streamer may not have configured the extension, \
      or you may need to grant user ID permission in the bottom right.  \
      Please try refreshing the page.";

    ui.displayInvalid(msg, msg2);

    return result;
  }

  // populate bounty object
  for (let i = 1; i < 6; i++) {

    // collect full name list separately for verification
    champNames.push($("#bounty_" + i + "_name").text());

    if ($("#bounty_kills_on_" + i + " input[type='checkbox']").prop("checked"))
    {

      champBounties.push({
        id: i,
        name: $("#bounty_" + i + "_name").text(),
        amount: $("#bounty_kills_on_" + i + " select").val()
      });

      indices.push(i);
    }
  }

  // bounty verifications

  if (!anyKillCondition && utils.isEmpty(champBounties)) {

    result.valid = false;

    const msg = "At least one bounty must be checked.";
    ui.displayModal("error", "bounty", msg);

    return result;
  }

  if ((anyKillCondition && (anyKillBounty === "default"))
      || (deathCondition && (deathPenalty === "default"))
      || (!utils.isEmpty(champBounties)
         && utils.containsUnselected(champBounties))) {

    result.valid = false;

    const msg = "Select bit amount.";
    ui.displayModal("error", "bounty", msg);
    ui.highlightInputsUnselectedBounty(anyKillCondition, anyKillBounty,
      deathCondition, deathPenalty, champBounties);

    return result;
  }

  anyKillBounty = parseInt(anyKillBounty, 10);
  deathPenalty = parseInt(deathPenalty, 10);

  for (let champBounty of champBounties) {
    champBounty.amount = parseInt(champBounty.amount, 10);
  }

  if ((anyKillCondition && (anyKillBounty < MIN_BOUNTY_BITS)) ||
      utils.containsTrivialBounty(champBounties)) {

    result.valid = false;

    const msg = "There is a " + MIN_BOUNTY_BITS + " bit bounty minimum.";
    ui.displayModal("error", "bounty", msg);
    ui.highlightInputsBountyMin(anyKillCondition, anyKillBounty, champBounties);

    return result;
  }

  if (deathCondition && (deathPenalty > MAX_DEATH_PENALTY)) {

    result.valid = false;

    const msg = "There is a " + MAX_DEATH_PENALTY + " bit death \
      penalty maximum.";
    ui.displayModal("error", "bounty", msg);
    $("#bounty_deaths select").addClass("error_input");

    return result;
  }

  result.data.channelId = ti.channelId;
  result.data.slAuth = SL_AUTH;
  result.data.token = ti.token;
  result.data.userId = ti.userId;
  result.data.userName = ti.userName;
  result.data.server = SERVER;
  result.data.alertsEnabled = ALERT_TOGGLE;
  result.data.minBountyAlerts = MIN_BOUNTY_ALERTS;
  result.data.summonerId = SUMMONER_ID;
  result.data.champNames = champNames;
  result.data.type = "bounty";
  result.data.mustWin = winCondition;
  result.data.anyKillBounty = anyKillCondition ? anyKillBounty : null;
  result.data.indices = !utils.isEmpty(indices) ? indices : null;
  result.data.champBounties = !utils.isEmpty(champBounties) ? champBounties : null;
  result.data.deathPenalty = deathCondition ? deathPenalty : null;

  return result;
}

verification.verifyBounty = verifyBounty;
