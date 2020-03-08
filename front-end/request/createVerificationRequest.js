// verify challenge or bounty
const createVerificationRequest = (type, method, data) => {

  return {
      type: type,
      contentType: "application/json",
      url: API_URL_ROOT + "/" + method,
      data: data,
      dataType: "json",
      success: response.processVerification,
      error: ui.logError
  }
}

request.createVerificationRequest = createVerificationRequest;
