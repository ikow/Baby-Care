// Create this new file to handle timezone conversions
function toLocalTime(date) {
  const offset = new Date().getTimezoneOffset();
  return new Date(date.getTime() - (offset * 60 * 1000));
}

function fromLocalTime(date) {
  const offset = new Date().getTimezoneOffset();
  return new Date(date.getTime() + (offset * 60 * 1000));
}

module.exports = {
  toLocalTime,
  fromLocalTime
}; 