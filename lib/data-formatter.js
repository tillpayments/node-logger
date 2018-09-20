const evalDataValue = (val) => {
  if (val instanceof Error) return val.message;
  return val;
}

const formatData = (data) => {
  // check if data is null
  if (data === undefined || data === null) return '';

  // if data is an array, return directly
  if (data.constructor === Array) return JSON.stringify(data);

  // handle error object
  if (data instanceof Error) return `${data.stack}`;

  // handle anything but not object
  if (data.constructor !== Object) return data.toString();

  // parse object
  const values = [];
  Object.keys(data).forEach(key => values.push(`${key}=${JSON.stringify(evalDataValue(data[key]))}`));
  return values.join(', ');
};

const leadingZero = value => `0${value}`.slice(-2);

const getDateString = date => `${date.getFullYear()}-${leadingZero(date.getMonth() + 1)}-${leadingZero(date.getDate())}`;

const getTimeString = date => `${date.toTimeString().match(/([\d:]+ [A-Z]+[+-][0-9]+)/)[1]}`;

const formatTimestamp = date => `${getDateString(date)} ${getTimeString(date)}`;

module.exports = {
  formatData,
  formatTimestamp,
};
