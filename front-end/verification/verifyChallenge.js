// verify challenge locally before server verification
const verifyChallenge = async () => {

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

  let challengeBits =  $("#challenge_bits select option:selected").val();
  const winCondition = $("#challenge_win input").prop("checked");
  const killCondition = $("#challenge_kills input[type='checkbox']")
    .prop("checked");
  const deathCondition = $("#challenge_deaths input[type='checkbox']")
    .prop("checked");

  let kills = killCondition ?
    $("#challenge_kills input[type='textbox']").val() : 0;

  let deaths = deathCondition ?
    $("#challenge_deaths input[type='textbox']").val() : 0;

  // check if config was retrieved
  if (MAX_KILLS === null) {

    result.valid = false;

    const msg = "Configuration was not retrieved.";

    const msg2 = "The streamer may not have configured the extension, \
      or you may need to grant user ID permission in the bottom right.  \
      Please try refreshing the page.";

    ui.displayInvalid(msg, msg2);

    return result;
  }

  // challenge verifications

  if (!winCondition && !killCondition && !deathCondition) {

    result.valid = false;

    const msg = "At least one condition must be set.";
    ui.displayModal("error", "challenge", msg);

    return result;
  }

  if ((killCondition && (kills === ""))
      || (deathCondition && (deaths === ""))) {

    result.valid = false;

    const msg = "Inputs cannot be blank.";
    ui.displayModal("error", "challenge", msg);
    ui.highlightInputsBlankChallenge(killCondition, kills,
      deathCondition, deaths);

    return result;
  }

  if (challengeBits === "default") {

    result.valid = false;

    const msg = "Select bit amount.";
    ui.displayModal("error", "challenge", msg);
    $("#challenge_bits select").addClass("error_input");

    return result;
  }

  challengeBits = parseInt(challengeBits, 10);
  kills = parseInt(kills, 10);
  deaths = parseInt(deaths, 10);

  if ((killCondition && (isNaN(kills) || (kills <= 0)))
      || (deathCondition && (isNaN(deaths) || (deaths < 0)))) {

    result.valid = false;

    const msg = "Inputs must be positive integers.";
    ui.displayModal("error", "challenge", msg);
    ui.highlightInputsPositiveChallengeInts(killCondition, kills,
      deathCondition, deaths);

    return result;
  }

  if (challengeBits < MIN_CHALLENGE_BITS) {

    result.valid = false;

    const msg = "There is a " + MIN_CHALLENGE_BITS + " bit minimum.";
    ui.displayModal("error", "challenge", msg);
    $("#challenge_bits select").addClass("error_input");

    return result;
  }

  if (killCondition && (kills > MAX_KILLS)) {

    result.valid = false;

    const msg = "There is a " + MAX_KILLS + " kill maximum.";
    ui.displayModal("error", "challenge", msg);
    $("#challenge_kills input[type='textbox']").addClass("error_input");

    return result;
  }

  if (deathCondition && (deaths < MIN_DEATHS)) {

    result.valid = false;

    const msg = "There is a " + MIN_DEATHS + " death minimum.";
    ui.displayModal("error", "challenge", msg);
    $("#challenge_deaths input[type='textbox']").addClass("error_input");

    return result;
  }

  result.data.channelId = ti.channelId;
  result.data.slAuth = SL_AUTH;
  result.data.token = ti.token;
  result.data.userId = ti.userId;
  result.data.userName = ti.userName;
  result.data.server = SERVER;
  result.data.alertsEnabled = ALERT_TOGGLE;
  result.data.minChallengeAlerts = MIN_CHALLENGE_ALERTS;
  result.data.summonerId = SUMMONER_ID;
  result.data.type = "challenge";
  result.data.mustWin = winCondition;
  result.data.minKills = killCondition ? kills : null;
  result.data.maxDeaths = deathCondition ? deaths : null;
  result.data.bits = challengeBits;

  return result;
}

const verification = {
  verifyChallenge: verifyChallenge
};
