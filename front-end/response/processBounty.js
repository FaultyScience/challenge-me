// process bounty submission response
const processBounty = async res => {

  ti.activeRequests -= 1;
  if (ti.activeRequests < 0) ti.activeRequests = 0;

  if (["lose", null].includes(res.body.bountyResult)) {

    processFail(res, res.body.bountyResult);
    return;
  }

  resetChampNames();
  useBits(res);
}

response.processBounty = processBounty;
