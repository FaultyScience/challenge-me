const jwt = require("jsonwebtoken");

const c = require("../routes/resources/constants");

function isValidToken(req) {

  const token = req.body.token;

  try {

    const decoded_token = jwt.verify(token, c.TWITCH_SECRET);

    if (!decoded_token.user_id) {
      throw "ID not shared";
    }

    return true;
  }
  catch (err) {

    if (err === "ID not shared") {
      return err;
    }

    return "Unauthorized";
  }
}

// validate jwt token issued by twitch, and also validate that user shared ID
// this will be checked with each request sent from user
function twitchAuth(req, res, next) {

  const valid = isValidToken(req);

  if (valid !== true) {

    if (valid === "Unauthorized") {

      console.log("Unauthorized request");
      res.status(401).send("Unauthorized");

    } else {

      console.log("ID not shared");
      res.status(400).send("User name retrieval failed");
    }

    return;
  }

  next();
}

module.exports = {
  twitchAuth: twitchAuth
};
