// get twitch user name
const createUserNameRequest = data => {

  return {
    type: "POST",
    contentType: "application/json",
    url: API_URL_ROOT + "/get-user-name",
    data: data,
    dataType: "json",
    error: ui.logError
  }
}

request.createUserNameRequest = createUserNameRequest;
