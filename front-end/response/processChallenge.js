// process challenge submission response
const processChallenge = async res => {

  ti.activeRequests -= 1;
  if (ti.activeRequests < 0) ti.activeRequests = 0;

  if (["lose", null].includes(res.body.challengeResult)) {

    processFail(res, res.body.challengeResult);
    return;
  }

  resetChampNames();
  useBits(res);
}

const response = {
  processChallenge: processChallenge
};
