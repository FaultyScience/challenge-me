$(function() {

  ti.twitchInit();

  $("#sl_authorize").attr("href", SL_AUTH_URL);

  $(".save").click(async () => {

    // check twitch auth
    if(!ti.token) {

      ui.displayModal("error", "config", "Not authorized. Please log in.");
      return;
    }

    try {

      // verify config locally
      const configData = await verification.verifyConfig();

      if (!configData.valid) { return; }

      // set config
      let req = request.createSetConfigRequest(JSON.stringify(configData.data));
      let res;

      res = await $.ajax(req);
      ti.twitchInit();
    }
    catch (err) {

      console.log(err);

      if (!err.responseJSON) {

        const msg = "Oops! Something went wrong.";
        const msg2 = "Please try again later."
        ui.displayInvalid(msg, msg2);

      } else {
        ui.displayModal("error", "config", "Configuration save failed.");
      }

      if (err.statusText === "timeout") { return; }
    }

    ui.displayModal("notification", "config", "Configuration saved.");
  });

  $("#backdrop, .close").click(() => {

    $("#backdrop").hide();
    $(".error_msg").hide();
    $(".notification").hide();
    $(".invalid").hide();
  });

  $("input, select").focus(() => {
    $("input").removeClass("error_input");
  });
});
