function useBits(res) {

  try {

    if (!alertStore.failProcessing && !alertStore.bitsProcessing) {

      alertStore.bitsProcessing = true;
      alertStore.type = res.body.type;
      alertStore.headerMsg = res.body.headerMsg;
      alertStore.alertMsg = res.body.alertMsg;
      alertStore.chatMsg = res.body.chatMsg;

      if (res.body.type === "challenge") {

        alertStore.challengeBits = res.body.bitsToSend;
        alertStore.minAlertBits = MIN_CHALLENGE_BITS;

      } else {

        alertStore.anyKillBounty = res.body.parameters.anyKillBounty;
        alertStore.champBounties = res.body.parameters.champBounties;
        alertStore.minAlertBits = MIN_BOUNTY_BITS;
      }

      twitch.bits.useBits(res.body.productSku);
      return;
    }

    setTimeout(useBits, 1000, res);
  }
  catch (err) {
    console.log(err);
  }
}
