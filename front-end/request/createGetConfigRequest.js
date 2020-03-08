// get streamer's configuration for challengeme
const createGetConfigRequest = data => {

  return {
      type: "POST",
      contentType: "application/json",
      url: API_URL_ROOT + "/get-config",
      data: data,
      dataType: "json",
      error: ui.logError
  }
}

request.createGetConfigRequest = createGetConfigRequest;
