// get enemy champ names once game is live or loading
const createGetEnemyChampsRequest = data => {

  const populateChampNames = res => {

    ti.activeRequests -= 1;
    if (ti.activeRequests < 0) ti.activeRequests = 0;

    const enemyChampNames = res.body.enemyChampNames;

    if (enemyChampNames) {

      for (let i = 1; i < 6; i++) {
        $("#bounty_" + i + "_name").text(enemyChampNames[i - 1]);
      }
    }
  };

  return {
      type: "POST",
      contentType: "application/json",
      url: API_URL_ROOT + "/get-enemy-champs",
      data: data,
      dataType: "json",
      success: populateChampNames,
      error: ui.logError
  }
}

request.createGetEnemyChampsRequest = createGetEnemyChampsRequest;
