// get sl token
const createSLAuthRequest = () => {

  return {
      type: "GET",
      contentType: "application/json",
      url: AUTH_URL_ROOT + "/sl-token",
      error: ui.logError
  }
}

request.createSLAuthRequest = createSLAuthRequest;
