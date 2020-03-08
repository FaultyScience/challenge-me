// not operational now
const createRequiredConfigRequest = data => {

  return {
      type: "POST",
      contentType: "application/json",
      url: API_URL_ROOT + "/set-required-config",
      data: data,
      dataType: "json",
      error: ui.logError
  }
}

const request = {
  createRequiredConfigRequest: createRequiredConfigRequest
};
