const requestIds = {
  "/api/verify-challenge": {},
  "/api/verify-bounty": {},
  "/api/submit-challenge": {},
  "/api/submit-bounty": {}
};

function isDuplicateRequest(req) {

  const route = req.originalUrl;
  const userId = req.body.userId;
  const currentTime = Number(new Date());

  if (requestIds[route] === undefined) { return false; }

  // map time to route and userId
  if (!requestIds[route][userId]) {

    requestIds[route][userId] = currentTime;
    return false;
  }

  const timeElapsed = currentTime - requestIds[route][userId];

  if (timeElapsed <= 150000) {
    return true;
  } else {

    requestIds[route][userId] = currentTime;
    return false;
  }
}

// check that user has not sent request from same IP in past 3 minutes.
// this is most important for duplicate requests that are sent
// from most browsers after 2.5 minutes if no response is received.
// this will usually be the case for this app (responses arrive after longer
// than 2.5 minutes).
function duplicateFilter(req, res, next) {

  if (isDuplicateRequest(req)) {

    console.log("Duplicate request");

    if (req.originalUrl === "/auth/streamlabs") {
      res.status(400).send("Duplicate auth request");
    } else {
      res.status(400).send("Duplicate request");
    }

    return;
  }

  next();
}

module.exports = {
  requestIds: requestIds,
  duplicateFilter: duplicateFilter
};
