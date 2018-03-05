const Logger = require('./Logger');

module.exports = (options) => {
  return new Logger(options).init();
};