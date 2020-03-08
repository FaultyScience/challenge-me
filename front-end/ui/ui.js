// used for displaying notifications and errors
const displayModal = (modalType, reqType, msg) => {

  $(".error_msg").hide();
  $(".notification").hide();
  $(".nullification").hide();
  $(".invalid").hide();

  if (modalType === "error") { modalType = "error_msg"; }

  $("#" + reqType + "_" + modalType + " p").text(msg);

  $("#backdrop").show();
  $("#" + reqType + "_" + modalType).show();
}

// used to display invalid requests
const displayInvalid = (msg1, msg2) => {

  $(".error_msg").hide();
  $(".notification").hide();
  $(".nullification").hide();
  $(".invalid").hide();

  $("#invalid p:nth-child(3)").text(msg1);
  $("#invalid p:nth-child(4)").text(msg2);

  $("#backdrop").show();
  $("#invalid").show();
}

const printLogs = (type, msg) => {
  console.log("Invalid " + type + ". " + msg);
}

// methods to highlight blank input fields

const highlightInputsBlankChallenge = (killCondition, kills,
  deathCondition, deaths) => {

  if (killCondition && (kills === "")) {
    $("#challenge_kills input[type='textbox']").addClass("error_input");
  }

  if (deathCondition && (deaths === "")) {
    $("#challenge_deaths input[type='textbox']").addClass("error_input");
  }
}

const highlightInputsPositiveChallengeInts = (killCondition,
  kills, deathCondition, deaths) => {

  if (killCondition && (isNaN(kills) || (kills <= 0))) {
    $("#challenge_kills input[type='textbox']").addClass("error_input");
  }

  if (deathCondition && (isNaN(deaths) || (deaths < 0))) {
    $("#challenge_deaths input[type='textbox']").addClass("error_input");
  }
}

const highlightInputsPositiveConfigInts = (minChallengeBits, maxKills,
  minBountyBits, maxDeathPenalty, minChallengeAlerts, minBountyAlerts) => {

  if (isNaN(minChallengeBits) || (minChallengeBits <= 0)) {
    $("#min_challenge_bits input[type='textbox']").addClass("error_input");
  }

  if (isNaN(maxKills) || (maxKills <= 0)) {
    $("#max_kills input[type='textbox']").addClass("error_input");
  }

  if (isNaN(minBountyBits) || (minBountyBits <= 0)) {
    $("#min_bounty_bits input[type='textbox']").addClass("error_input");
  }

  if (isNaN(maxDeathPenalty) || (maxDeathPenalty <= 0)) {
    $("#max_death_penalty input[type='textbox']").addClass("error_input");
  }

  if (isNaN(minChallengeAlerts) || (minChallengeAlerts <= 0)) {
    $("#min_challenge_alerts input[type='textbox']").addClass("error_input");
  }

  if (isNaN(minBountyAlerts) || (minBountyAlerts <= 0)) {
    $("#min_bounty_alerts input[type='textbox']").addClass("error_input");
  }
}

const highlightInputsUnselectedBounty = (anyKillCondition, anyKillBounty,
  deathCondition, deathPenalty, champBounties) => {

  if (anyKillCondition && (anyKillBounty === "default")) {
    $("#bounty_kills select").addClass("error_input");
  }

  if (deathCondition && (deathPenalty === "default")) {
    $("#bounty_deaths select").addClass("error_input");
  }

  for (let champBounty of champBounties) {

    let checked = $("#bounty_kills_on_" + champBounty.id +
      " input[type='checkbox']").prop("checked");

    if (checked && (champBounty.amount === "default")) {
      $("#bounty_kills_on_" + champBounty.id + " select")
        .addClass("error_input");
    }
  }
}

// highlight inputs if below bounty minimum
const highlightInputsBountyMin = (anyKillCondition, anyKillBounty,
  champBounties) => {

  if (anyKillCondition && (anyKillBounty < MIN_BOUNTY_BITS)) {
    $("#bounty_kills .bounty_bits").addClass("error_input");
  }

  for (let champBounty of champBounties) {

    let checked = $("#bounty_kills_on_" + champBounty.id +
      " input[type='checkbox']").prop("checked");

    if (checked && (champBounty.amount < MIN_BOUNTY_BITS)) {

      $("#bounty_kills_on_" + champBounty.id + " .bounty_bits")
        .addClass("error_input");
    }
  }
}

// display errors when request rejected
const logError = (_, error, status) => {

  ti.activeRequests -= 1;
  if (ti.activeRequests < 0) ti.activeRequests = 0;

  let msg;

  if (_.responseText === "Duplicate request") {

    msg = "Duplicate request. You must wait 3 minutes after submitting \
      a challenge or bounty before submitting another.";

    let msg2 = "Challenges and bounties are considered separately for \
      this purpose.";

    displayInvalid(msg, msg2);

  } else if (_.responseText === "Duplicate auth request") {

    msg = "Duplicate request. You must wait 3 minutes after submitting \
      an authorization before submitting another.";

    displayInvalid(msg, "");

  } else if (_.responseText === "User name retrieval failed") {

    msg = "User name retrieval failed.  You must enable ID sharing to \
      use this extension.";

    displayInvalid(msg, "");

  } else if (!_.responseJSON) {

    msg = "Oops! Something went wrong.";
    msg2 = "Please try again later.";
    displayInvalid(msg, msg2);

  } else if (_.responseJSON.body.message === "User name retrieval failed") {

    msg = "User name retrieval failed.  You must enable ID sharing to \
      use this extension.";

    displayInvalid(msg, "");

  } else if (_.responseJSON.body.message === "All given champion names must match an enemy name") {

    msg = "The enemy champ names listed here do not match the current game.  \
      Click \"Get Enemy Champs\", then try again.";

    resetChampNames();
    displayModal("error", "bounty", msg);

  } else if (_.responseJSON.body.message === "Enemy champ names not populated") {

    msg = "Enemy champ names were not retrieved.  \
      Click \"Get Enemy Champs\", then try again.";

    resetChampNames();
    displayModal("error", "bounty", msg);

  } else if (_.responseJSON.body.verified !== undefined) {

    msg = _.responseJSON.body.message;

    if (_.responseJSON.body.parameters.type === "challenge") {
      msg = "Challenge not initiated: " + msg;
    } else {
      msg = "Bounty not set: " + msg;
    }

    displayModal("error", _.responseJSON.body.parameters.type, msg);

  } else if (_.responseJSON.body.parameters && _.responseJSON.body.parameters.type) {

    msg = _.responseJSON.body.nullMsg + "\n\n";

    if (_.status === 503)
      msg += "Game data service is unavailable at this time. \
        Please try again later.";
    else if (_.status === 404)
      msg += "Game data is unavailable. Please try again later.";
    else if (_.staus === 429)
      msg += "Game data service is busy. Please try again later.";
    else
      msg += _.responseJSON.body.message;

    displayModal("nullification", _.responseJSON.body.parameters.type, msg);
  }
  else {

    msg = _.responseJSON.body.message;
    displayInvalid(msg, "");
  }
}

const ui = {
  displayModal: displayModal,
  displayInvalid: displayInvalid,
  printLogs: printLogs,
  highlightInputsBlankChallenge: highlightInputsBlankChallenge,
  highlightInputsPositiveChallengeInts: highlightInputsPositiveChallengeInts,
  highlightInputsPositiveConfigInts: highlightInputsPositiveConfigInts,
  highlightInputsUnselectedBounty: highlightInputsUnselectedBounty,
  highlightInputsBountyMin: highlightInputsBountyMin,
  logError: logError
};
