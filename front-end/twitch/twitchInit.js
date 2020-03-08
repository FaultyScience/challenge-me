const twitch = window.Twitch.ext;

const ti = {
  channelId: null,
  clientId: null,
  token: null,
  userId: null,
  userName: null,
  activeRequests: 0
};

// object to store alert parameters
const alertStore = {
  bitsProcessing: false,
  failProcessing: false,
  type: null,
  headerMsg: null,
  alertMsg: null,
  chatMsg: null,
  challengeBits: null,
  minAlertBits: null,
  anyKillBounty: null,
  champBounties: null
};

// this is fired first
const twitchInit = () => {

  twitch.onAuthorized(async auth => {

    ti.channelId = auth.channelId;
    ti.clientId = auth.clientId;
    ti.token = auth.token;

    let res;

    try {

      const data = { token: ti.token };
      const req = request.createUserNameRequest(JSON.stringify(data));

      ti.activeRequests += 1;
      res = await $.ajax(req);
      ti.activeRequests -= 1;

      ti.userId = res.body.userId;
      ti.userName = res.body.userName;
    }
    catch (err) {
      console.log(err);
    }

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
      return;
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

    $(".server_region option[value=" + SERVER + "]").prop("selected", true);
    if (SUMMONER_ID) { $("#summoner_id .config_text").val(SUMMONER_ID); }
    if (MIN_CHALLENGE_BITS) { $("#min_challenge_bits .config_text").val(MIN_CHALLENGE_BITS); }
    if (MAX_KILLS) { $("#max_kills .config_text").val(MAX_KILLS); }
    if ((MIN_DEATHS === 0) || MIN_DEATHS) { $("#min_deaths .config_text").val(MIN_DEATHS); }
    if (MIN_BOUNTY_BITS) { $("#min_bounty_bits .config_text").val(MIN_BOUNTY_BITS); }
    if (MAX_DEATH_PENALTY) { $("#max_death_penalty .config_text").val(MAX_DEATH_PENALTY); }
    $("#alert_toggle input[type='checkbox']").prop("checked", ALERT_TOGGLE);
    if (MIN_CHALLENGE_ALERTS) { $("#min_challenge_alerts .config_text").val(MIN_CHALLENGE_ALERTS); }
    if (MIN_BOUNTY_ALERTS) { $("#min_bounty_alerts .config_text").val(MIN_BOUNTY_ALERTS); }
  });

  // post alert and chat message when transaction complete
  twitch.bits.onTransactionComplete(async () => {

    let req;

    const alertData = {
      token: ti.token,
      slAuth: SL_AUTH,
      type: alertStore.type,
      headerMsg: alertStore.headerMsg,
      alertMsg: alertStore.alertMsg,
      alertsEnabled: ALERT_TOGGLE,
      challengeBits: alertStore.challengeBits,
      minAlertBits: alertStore.minAlertBits,
      anyKillBounty: alertStore.anyKillBounty,
      champBounties: alertStore.champBounties
    };

    try {

      req = request.createAlertRequest(JSON.stringify(alertData));

      ti.activeRequests += 1;
      await $.ajax(req);
      ti.activeRequests -= 1;
    }
    catch (err) {
      console.log(err);
    }

    const msgData = {
      token: ti.token,
      channelId: ti.channelId,
      msg: alertStore.chatMsg
    };

    try {

      req = request.createChatMsgRequest(JSON.stringify(msgData));

      ti.activeRequests += 1;
      await $.ajax(req);
      ti.activeRequests -= 1;
    }
    catch (err) {
      console.log(err);
    }

    alertStore.type = null;
    alertStore.headerMsg = null;
    alertStore.alertMsg = null;
    alertStore.chatMsg = null;
    alertStore.challengeBits = null;
    alertStore.minAlertBits = null;
    alertStore.anyKillBounty = null;
    alertStore.champBounties = null;
    alertStore.bitsProcessing = false;
  });

  // clear processing when transaction cancelled
  twitch.bits.onTransactionCancelled(async () => {

    alertStore.type = null;
    alertStore.headerMsg = null;
    alertStore.alertMsg = null;
    alertStore.chatMsg = null;
    alertStore.challengeBits = null;
    alertStore.minAlertBits = null;
    alertStore.anyKillBounty = null;
    alertStore.champBounties = null;
    alertStore.bitsProcessing = false;
  });

  // request id share upon initiation
  twitch.actions.requestIdShare();
};

ti.twitchInit = twitchInit;
