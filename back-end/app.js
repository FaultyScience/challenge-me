const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

const auth = require("./auth/twitchAuth");
const df = require("./filter/duplicateFilter");
const root = require("./routes/root");
const streamlabsAuth = require("./auth/streamlabsAuth");
const setRequiredConfig = require("./routes/setRequiredConfig");
const getConfig = require("./routes/getConfig");
const setConfig = require("./routes/setConfig");
const getUserName = require("./routes/getUserName");
const getEnemyChamps = require("./routes/getEnemyChamps");
const verifyChallenge = require("./routes/verifyChallenge");
const verifyBounty = require("./routes/verifyBounty");
const serverAuth = require("./auth/serverAuth");
const submitChallenge = require("./routes/submitChallenge");
const submitBounty = require("./routes/submitBounty");
const chatMsg = require("./routes/chatMsg");
const alert = require("./routes/alert");
const generateAppToken = require("./routes/resources/appToken").generateAppToken;
const generateChampMaps = require("./maps/generateChampMaps");

const app = express();

app.use(cors());
app.use(express.json());
// riot verification only
app.use(express.static("riot"));
app.use(df.duplicateFilter);
app.use("/", root);
// streamlabs authorization is first - app will not function without it
app.use("/auth", streamlabsAuth);
// next is twitch auth - validated with every request
app.use("/api", auth.twitchAuth);
// required config is not operational on twitch's end
// app.use("/api", setRequiredConfig);
app.use("/api", getConfig);
app.use("/api", setConfig);
app.use("/api", getUserName);
// get enemy champ names
app.use("/api", getEnemyChamps);
// verify challenge or bounty
app.use("/api", verifyChallenge);
app.use("/api", verifyBounty);
// post twitch chat msg and streamlabs alert
app.use("/api", chatMsg);
app.use("/api", alert);
// if request is a submit, then authorize token issued by this server first
app.use("/api", serverAuth.checkVerification);
// submit challenge or bounty
app.use("/api", submitChallenge);
app.use("/api", submitBounty);

// generate champ maps from riot data every 5 minutes
generateChampMaps();

// generate app token, and check every hour
generateAppToken();

const portSecure = 443;

const httpsOptions = {
  cert: fs.readFileSync("./ssl/challengeme123_com.crt"),
  ca: fs.readFileSync("./ssl/challengeme123_com.ca-bundle"),
  key: fs.readFileSync("./ssl/challengeme123_com.key")
};

const serverSecure = https.createServer(httpsOptions, app);

serverSecure.listen(portSecure, () => {
  console.log(`Listening on port ${portSecure}...`);
});

serverSecure.setTimeout(9000000);
