// process verification response
const processVerification = async res => {

  ti.activeRequests -= 1;
  if (ti.activeRequests < 0) ti.activeRequests = 0;

  const resData = res.body.parameters;
  resData["token"] = ti.token;
  resData["verificationToken"] = res.body.verificationToken;
  resData["userId"] = ti.userId;
  resData["userName"] = ti.userName;
  resData["server"] = SERVER;
  resData["summonerId"] = SUMMONER_ID;
  resData["gameId"] = res.body.gameId;
  resData["channelId"] = ti.channelId;
  resData["slAuth"] = SL_AUTH;
  resData["alertsEnabled"] = ALERT_TOGGLE;
  resData["minChallengeAlerts"] = MIN_CHALLENGE_ALERTS;
  resData["minBountyAlerts"] = MIN_BOUNTY_ALERTS;

  if (resData.type === "bounty") {
    resData["bountyNames"] = res.body.bountyNames;
  }

  if (res.body.verified) {

    // display initial notification that challenge or bounty went through
    ui.displayModal("notification", resData.type, res.body.panelMsg);

    // submit challenge or bounty
    const method = resData.type === "challenge" ? "submit-challenge"
      : "submit-bounty";

    const req = request.createSubmissionRequest("POST", method, JSON.stringify(resData));

    try {

      ti.activeRequests += 1;
      const res = await $.ajax(req);
    }
    catch (err) {

      console.log(err);

      if (err.statusText === "timeout") { return; }
    }
  }
}

response.processVerification = processVerification;
