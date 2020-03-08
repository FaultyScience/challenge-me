function processFail(res, result) {

  try {

    if (!alertStore.failProcessing && !alertStore.bitsProcessing) {

      alertStore.failProcessing = true;

      let type = res.body.type;
      type = type.charAt(0).toUpperCase() + type.slice(1);

      if (result === "lose") {

        ui.displayModal("result", res.body.type, res.body.failMsg);
        resetChampNames();
        return;

      } else if (result === null) {
        
        ui.displayModal("nullification", res.body.type, res.body.nullMsg);
        resetChampNames();
        return;
      }

      return;
    }

    setTimeout(processFail, 1000, res, result);
  }
  catch (err) {
    console.log(err);
  }
}
