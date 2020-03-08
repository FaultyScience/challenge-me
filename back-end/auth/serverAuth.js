const jwt = require("jsonwebtoken");

const c = require("../routes/resources/constants");

function isValidToken(req) {

  const token = req.body.verificationToken;

  try {

    jwt.verify(token, c.SERVER_SECRET);
    return true;
  }
  catch (err) {
    return false;
  }
}

// validate jwt token issued by this server
function checkVerification(req, res, next) {

  if (!isValidToken(req)) {

    console.log("Unauthorized request");
    res.status(401).send("Unauthorized");
    return;
  }

  next();
}

module.exports = {
  checkVerification: checkVerification
};
