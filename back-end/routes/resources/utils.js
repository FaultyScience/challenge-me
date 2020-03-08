const isObject = obj => {
  return (typeof(obj) === "object") && (obj !== null);
}

const isEmpty = arr => {
  return arr.length === 0;
}

// check if any amount property on object <= 0
const containsZeroOrNeg = arr => {

  for (let i = 0; i < arr.length; i++) {

    if (arr[i].amount <= 0) {
      return true;
    }
  }

  return false;
}

const insensitiveIncludes = (arr, str) => {

  const regex = RegExp("^" + str + "$", "i");

  for (let i = 0; i < arr.length; i++) {
    if (regex.test(arr[i])) { return true; }
  }

  return false;
}

// return sum of any kill bounty + bounty for each champ
const calcPerKillSumTotal = (anyKillBounty, champBounties) => {

  let sumTotal = 0;

  if (anyKillBounty !== null) {
    sumTotal += anyKillBounty;
  }

  if (champBounties !== null) {

    for (let champBounty of champBounties) {
      sumTotal += champBounty.amount;
    }
  }

  return sumTotal;
};

module.exports = {
  isObject: isObject,
  isEmpty: isEmpty,
  containsZeroOrNeg: containsZeroOrNeg,
  insensitiveIncludes: insensitiveIncludes,
  calcPerKillSumTotal: calcPerKillSumTotal
};
