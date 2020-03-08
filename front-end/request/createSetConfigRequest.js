// set streamer's configuration for challengeme
const createSetConfigRequest = data => {

  return {
      type: "POST",
      contentType: "application/json",
      url: API_URL_ROOT + "/set-config",
      data: data,
      dataType: "json",
      error: ui.logError
  }
}

request.createSetConfigRequest = createSetConfigRequest;
