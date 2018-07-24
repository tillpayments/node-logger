const formatData = (data) => {
  // check if data is null
  if (data === undefined || data === null) return '';

  // if data is an array, return directly
  if (data.constructor === Array) return JSON.stringify(data);

  // handle anything but not object
  if (data.constructor !== Object) return data.toString();

  // parse object
  const values = [];
  Object.keys(data).forEach(key => values.push(`${key}=${JSON.stringify(data[key])}`));
  return values.join(', ');
};

const formatTimestamp = date => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.toTimeString()}`;

module.exports = {
  formatData,
  formatTimestamp,
};
