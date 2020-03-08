const isEmpty = arr => {
  return arr.length === 0;
}

// check if object contains unselected drop down value
const containsUnselected = obj => {

  let result = false;

  $.each(obj, (index, val) => {

    if (val.amount === "default") {

      result = true;
      return false;
    }
  });

  return result;
}

// check if object contains any default champ names
const containsDefaultNames = obj => {

  let result = false;

  $.each(obj, (index, val) => {

    if (val.name === DEFAULT_NAME) {

      result = true;
      return false;
    }
  });

  return result;
}

// check if object onctains any bounties below minimum bounty bits
const containsTrivialBounty = obj => {

  let result = false;

  $.each(obj, (index, val) => {

    let checked = $("#bounty_kills_on_" + val.id + " input[type='checkbox']")
      .prop("checked");

    if (checked && (val.amount < MIN_BOUNTY_BITS)) {

      result = true;
      return false;
    }
  });

  return result;
}

const utils = {
  isEmpty: isEmpty,
  containsUnselected: containsUnselected,
  containsDefaultNames: containsDefaultNames,
  containsTrivialBounty: containsTrivialBounty
};
