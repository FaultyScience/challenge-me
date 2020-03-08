// verify config locally
const verifyConfig = async () => {

  let result = {
    valid: true,
    data: {}
  };

  const server =  $("#server select").val();
  let summonerId =  $("#summoner_id input[type='textbox']").val();
  let minChallengeBits = $("#min_challenge_bits input[type='textbox']").val();
  let maxKills = $("#max_kills input[type='textbox']").val();
  let minDeaths = $("#min_deaths input[type='textbox']").val();
  let minBountyBits = $("#min_bounty_bits input[type='textbox']").val();
  let maxDeathPenalty = $("#max_death_penalty input[type='textbox']").val();
  const alertToggle = $("#alert_toggle input[type='checkbox']").prop("checked");
  let minChallengeAlerts = $("#min_challenge_alerts input[type='textbox']").val();
  let minBountyAlerts = $("#min_bounty_alerts input[type='textbox']").val();

  if (!summonerId) {

    result.valid = false;

    const msg = "Summoner name cannot be blank.";
    ui.displayModal("error", "config", msg);
    $("#summoner_id input[type='textbox']").addClass("error_input");

    return result;
  }

  if (!minChallengeBits) { minChallengeBits = "100"; }
  if (!maxKills) { maxKills = "20"; }
  if (!minDeaths) { minDeaths = "3"; }
  if (!minBountyBits) { minBountyBits = "50"; }
  if (!maxDeathPenalty) { maxDeathPenalty = "2500"; }
  if (!minChallengeAlerts) { minChallengeAlerts = "100"; }
  if (!minBountyAlerts) { minBountyAlerts = "50"; }

  minChallengeBits = parseInt(minChallengeBits, 10);
  maxKills = parseInt(maxKills, 10);
  minDeaths = parseInt(minDeaths, 10);
  minBountyBits = parseInt(minBountyBits, 10);
  maxDeathPenalty = parseInt(maxDeathPenalty, 10);
  minChallengeAlerts = parseInt(minChallengeAlerts, 10);
  minBountyAlerts = parseInt(minBountyAlerts, 10);

  if ((isNaN(minChallengeBits) || (minChallengeBits <= 0))
      || (isNaN(maxKills) || (maxKills <= 0))
      || (isNaN(minDeaths) || (minDeaths <= 0))
      || (isNaN(minBountyBits) || (minBountyBits <= 0))
      || (isNaN(maxDeathPenalty) || (maxDeathPenalty <= 0))
      || (isNaN(minChallengeAlerts) || (minChallengeAlerts <= 0))
      || (isNaN(minBountyAlerts) || (minBountyAlerts <= 0))) {

    result.valid = false;

    const msg = "Inputs must be positive integers.";
    ui.displayModal("error", "config", msg);
    ui.highlightInputsPositiveConfigInts(minChallengeBits, maxKills,
      minBountyBits, maxDeathPenalty, minChallengeAlerts, minBountyAlerts);

    return result;
  }

  if (isNaN(minDeaths) || (minDeaths < 0)) {

    result.valid = false;

    const msg = "Minimum deaths must be a non-negative integer.";
    ui.displayModal("error", "config", msg);
    $("#min_deaths input[type='textbox']").addClass("error_input");

    return result;
  }

  let slAuth = null;

  const data = {
    token: ti.token,
    channelId: ti.channelId
  };

  try {

    ti.activeRequests += 1;
    res = await $.ajax(request.createGetConfigRequest(JSON.stringify(data)));
    ti.activeRequests -= 1;

    if (!res.body.slAuth) {

      ti.activeRequests += 1;
      slAuth = await $.ajax(request.createSLAuthRequest());
      ti.activeRequests -= 1;

    } else {
      slAuth = res.body.slAuth;
    }
  }
  catch (err) {

    console.log(err);
    result.valid = false;

    if (!err.responseJSON) {

      const msg = "Oops! Something went wrong.";
      const msg2 = "Please try again later."
      ui.displayInvalid(msg, msg2);

    } else {
      ui.displayModal("error", "config", "Configuration save failed.");
    }

    return result;
  }

  result.data.token = ti.token;
  result.data.userId = ti.userId;
  result.data.channelId = ti.channelId;
  result.data.slAuth = slAuth;
  result.data.server = server;
  result.data.summonerId = summonerId;
  result.data.minChallengeBits = minChallengeBits;
  result.data.maxKills = maxKills;
  result.data.minDeaths = minDeaths;
  result.data.minBountyBits = minBountyBits;
  result.data.maxDeathPenalty = maxDeathPenalty;
  result.data.alertToggle = alertToggle;
  result.data.minChallengeAlerts = minChallengeAlerts;
  result.data.minBountyAlerts = minBountyAlerts;

  return result;
}

const verification = {
  verifyConfig: verifyConfig
};
