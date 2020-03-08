// post stream alert
const createAlertRequest = data => {

  return {
    type: "POST",
    contentType: "application/json",
    url: API_URL_ROOT + "/post-alert",
    data: data,
    dataType: "json",

    error: err => {

      ti.activeRequests -= 1;
      console.log("Alert request returned error " + err.status + ": "
        + err.statusText);
    }
  }
}

request.createAlertRequest = createAlertRequest;
