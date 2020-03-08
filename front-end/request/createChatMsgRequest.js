// post twitch chat message
const createChatMsgRequest = data => {

  return {
    type: "POST",
    contentType: "application/json",
    url: API_URL_ROOT + "/post-chat-msg",
    data: data,
    dataType: "json",

    error: err => {

      ti.activeRequests -= 1;
      console.log("Chat message request returned error " + err.status + ": "
        + err.statusText);
    }
  }
}

request.createChatMsgRequest = createChatMsgRequest;
