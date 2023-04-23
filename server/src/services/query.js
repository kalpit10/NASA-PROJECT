const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 0;

function getPagination(query) {
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
  //it returns the absolute value of number
  // if the number is -ve, it returns the positive value of that number and if it is positive then it returns positive
  //number and if you pass a string, it will convert that string into a number
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  };
}

module.exports = {
  getPagination,
};
