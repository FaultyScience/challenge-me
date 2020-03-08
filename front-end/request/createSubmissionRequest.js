// submit challenge or bounty
const createSubmissionRequest = (type, method, data) => {

  let processRes;

  if (method === "submit-challenge")
    processRes = response.processChallenge;
  else if (method === "submit-bounty")
    processRes = response.processBounty;

  return {
      type: type,
      contentType: "application/json",
      url: API_URL_ROOT + "/" + method,
      data: data,
      dataType: "json",
      success: processRes,
      error: ui.logError
  }
}

const request = {
  createSubmissionRequest: createSubmissionRequest
};
