const axios = require("axios");

// post alert on stream using streamlabs api
async function postAlert(token, headerMsg, msg) {

  try {

    const url = "https://streamlabs.com/api/v1.0/alerts";

    const data = {
      access_token: token,
      type: "donation",
      message: headerMsg,
      user_message: msg
    };

    const res = await axios.post(url, data);

    return 200;
  }

  catch (err) {

    console.log(err.message);
    return err.response.status;
  }
}

module.exports = {
  postAlert: postAlert
};
