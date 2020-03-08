const express = require("express");
const jwt = require("jsonwebtoken");

const msg = require("./resources/messages");
const c = require("./resources/constants");
const api = require("./resources/slApi");
const utils = require("./resources/utils");

const router = express.Router();

// route to post streamlabs alert
router.post("/post-alert", async (req, res) => {

  let successMsg = msg.ALERT_SUCCESS;
  let status = 200;

  const type = req.body.type;
  const slAuth = req.body.slAuth;
  const headerMsg = req.body.headerMsg;
  const alertMsg = req.body.alertMsg;
  const challengeBits = req.body.challengeBits;
  const minAlertBits = req.body.minAlertBits;
  const alertsEnabled = req.body.alertsEnabled;
  const anyKillBounty = req.body.anyKillBounty;
  const champBounties = req.body.champBounties;
  let bountyPerKillSumTotal;
  let challengeOrPerKillBits;

  if (type === "bounty") {

    bountyPerKillSumTotal = utils.calcPerKillSumTotal(anyKillBounty, champBounties);
    challengeOrPerKillBits = bountyPerKillSumTotal;

  } else {
    challengeOrPerKillBits = challengeBits;
  }

  // post stream alert
  if (!alertsEnabled) {
    successMsg = msg.ALERT_DISABLED;
  } else if ((alertMsg !== "") && (challengeOrPerKillBits >= Number(minAlertBits))) {

    const slToken = jwt.verify(slAuth, c.SL_CLIENT_SECRET);
    const res = await api.postAlert(slToken, headerMsg, alertMsg);

    if (res !== 200) {

      successMsg = msg.ALERT_FAIL;
      status = res;
    }

  } else {

    successMsg = msg.ALERT_FAIL;
    status = 400;
  }

  const body = {
    message: successMsg,

    parameters: {
      type: type,
      slAuth: slAuth,
      headerMsg: headerMsg,
      alertMsg: alertMsg,
      challengeBits: challengeBits,
      anyKillBounty: anyKillBounty,
      champBounties: champBounties,
      challengeOrPerKillBits: challengeOrPerKillBits,
      minAlertBits: minAlertBits,
      alertsEnabled: alertsEnabled
    }
  };

  const response = {
    statusCode: status,
    body: body
  };

  console.log(body.message);
  res.status(status).send(response);
});

module.exports = router;
