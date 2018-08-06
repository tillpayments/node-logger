const os = require('os');
const assert = require('assert');
const logRotator = require('./log-rotator');
const dataFormatter = require('./data-formatter');

const LEVEL = {
  ALL: 'all',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
  OFF: 'off',
};
const LOG_LEVELS = [LEVEL.ALL, LEVEL.DEBUG, LEVEL.INFO, LEVEL.WARN, LEVEL.ERROR, LEVEL.FATAL, LEVEL.OFF];

/**
 * Logger to provide logging capabilities, and together with:
 * - standard log levels
 * - support multiple log transport channel
 * - support log rotation
 * - get child logger with a different log category
 * - customise date format
 * - add external log handler (data will be in JSON object)
 */
class Logger {
  constructor(config) {
    this.config = config || {};
    this.category = this.config.category || 'main';
    this.level = this.config.level || 'all';
    this.transports = this.config.transports || [];
    this.logHandlers = this.config.logHandlers || [];
    if (typeof this.config.dateFormatter === 'function') this.dateFormatter = this.config.dateFormatter;

    LOG_LEVELS.forEach((level) => { this[level] = this.log.bind(this, level); });

    this.init();
  }

  init() {
    this.transports.forEach((transport) => {
      if (transport.type === 'file') {
        assert(transport.filePath, 'log file path must be provided');
        /* eslint-disable no-param-reassign */
        transport.maxSize = transport.maxSize || 1000;
        transport.maxRotation = transport.maxRotation || 5;
        transport.level = transport.level || this.level;
        /* eslint-enable no-param-reassign */
        logRotator.evaluateLogFileRotation(transport);
      }
    });
  }

  setDateFormatter(dateFormatter) {
    if (typeof dateFormatter === 'function') this.dateFormatter = dateFormatter;
    else this.dateFormatter = null;
  }

  addLogHandler(handler, options) {
    if (typeof handler !== 'function') return;
    // add new handler
    this.logHandlers.push({
      handler,
      level: options ? options.level : 'all',
      category: options ? options.category : null,
    });
  }

  clearLogHandlers() {
    this.logHandlers = [];
  }

  buildLogString(logJsonData) {
    const { level, message, category, date, context, data } = logJsonData;
    const dateString = this.dateFormatter ? this.dateFormatter(date)
      : dataFormatter.formatTimestamp(date);
    const levelString = `[${level.toUpperCase()}]`;
    const messageString = dataFormatter.formatData(message);
    const contextString = context ? `, ${dataFormatter.formatData(context)}` : '';
    const dataString = data ? `, ${dataFormatter.formatData(data)}` : '';
    return `${dateString} ${levelString} (${category})\t${messageString}${contextString}${dataString}`;
  }

  execLog(targetLevel, message, dataDefinition) {
    const levelIndex = LOG_LEVELS.indexOf(targetLevel);
    const level = levelIndex === -1 ? LEVEL.ALL : targetLevel;
    const category = dataDefinition.category || this.category;
    const date = new Date();
    const logJsonData = {
      date,
      timestamp: Math.floor(date / 1000), // epoch
      level,
      category,
      message,
      context: dataDefinition.context,
      data: dataDefinition.data,
    };
    const logString = this.buildLogString(logJsonData);

    // log per transport
    this.transports.forEach((transport) => {
      const tpLogLevelIndex = LOG_LEVELS.indexOf(transport.level);
      if (levelIndex >= tpLogLevelIndex) {
        switch (transport.type) {
          case 'console':
            process.stdout.write(logString + os.EOL);
            break;
          case 'file':
            if (!transport.dataStream) break;
            logRotator.evaluateLogFileRotation(transport);
            if (transport.writeJson) {
              transport.dataStream.write(JSON.stringify(logJsonData) + os.EOL);
            } else {
              transport.dataStream.write(logString + os.EOL);
            }
            break;
          default:
        }
      }
    });

    // call handler
    this.logHandlers.forEach((handlerDef) => {
      // check category
      if (handlerDef.category && handlerDef.category !== category) return;
      // check level index
      const handlerLevelIndex = LOG_LEVELS.indexOf(handlerDef.level);
      if (levelIndex < handlerLevelIndex) return;
      // check handler type
      if (typeof handlerDef.handler !== 'function') return;
      // notify handler
      handlerDef.handler(logJsonData);
    });
  }

  getChildLogger(category, context) {
    const childLogger = {
      log: (level, message, data) => this.execLog(level, message, { category, context, data }),
    };
    LOG_LEVELS.forEach((level) => { childLogger[level] = childLogger.log.bind(this, level); });
    return childLogger;
  }

  log(level, message, data) {
    this.execLog(level, message, { data });
  }
}

module.exports = Logger;
