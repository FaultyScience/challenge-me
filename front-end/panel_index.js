$(function() {

  ti.twitchInit();

  $("#submit_challenge").click(async () => {

    // check twitch auth
    if(!ti.token) {

      ui.displayModal("error", "challenge", "Not authorized. Please log in.");
      return;
    }

    // verify challenge locally
    const challengeData = await verification.verifyChallenge();

    if (!challengeData.valid) { return; }

    // verify challenge, then process verification, then submit
    const req = request.createVerificationRequest("POST", "verify-challenge",
      JSON.stringify(challengeData.data));

    try {

      ti.activeRequests += 1;
      const res = await $.ajax(req);
    }
    catch (err) {

      console.log(err);

      if (err.statusText === "timeout") { return; }
    }
  });

  $("#get_enemy_champs").click(async () => {

    // check twitch auth
    if(!ti.token) {

      ui.displayModal("error", "bounty", "Not authorized. Please log in.");
      return;
    }

    const data = {
      channelId: ti.channelId,
      slAuth: SL_AUTH,
      token: ti.token,
      userId: ti.userId,
      userName: ti.userName,
      server: SERVER,
      summonerId: SUMMONER_ID
    };

    // retrieve enemy champ names
    const req = request.createGetEnemyChampsRequest(JSON.stringify(data));

    try {

      ti.activeRequests += 1;
      const res = await $.ajax(req);
    }
    catch (err) {

      console.log(err);
      resetChampNames();

      if (err.statusText === "timeout") { return; }
    }
  });

  $("#submit_bounty").click(async () => {

    // check twitch auth
    if(!ti.token) {

      ui.displayModal("error", "bounty", "Not authorized. Please log in.");
      return;
    }

    // verify bounty locally
    const bountyData = await verification.verifyBounty();

    if (!bountyData.valid) { return; }

    // verify bounty, then process verification, then submit
    const req = request.createVerificationRequest("POST", "verify-bounty",
      JSON.stringify(bountyData.data));

    try {

      ti.activeRequests += 1;
      const res = await $.ajax(req);
    }
    catch (err) {

      console.log(err);

      if (err.statusText === "timeout") { return; }
    }
  });

  $("#backdrop, .close").click(() => {

    $("#backdrop").hide();
    $(".error_msg").hide();
    $(".notification").hide();
    $(".nullification").hide();
    $(".invalid").hide();

    alertStore.failProcessing = false;
  });

  $("input, select").focus(() => {

    $("input").removeClass("error_input");
    $("select").removeClass("error_input");
  });
});
