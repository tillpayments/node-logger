const _ = require('lodash');
const os = require('os');
const stream = require('stream');
const assert = require('assert');
const fs = require('fs');
const dateformat = require('./date-format');

const DEFAULT_LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5,
};

class Logger {
  constructor(options) {
    options = options || {};
    if (typeof options === 'string') {
      options = {
        category: options,
        level: 'info',
      }
    }

    this.category = options.category || 'main';
    this.dateFormat = options.dateFormat || null;
    this.transports = options.transports || [];

    this.levels = options.levels || DEFAULT_LOG_LEVELS;

    _.forEach(this.levels, (index, level) => {
      this[level] = this.log.bind(this, level);
    });
  }

  init() {
    _.forEach(this.transports, (transport) => {
      if (transport.type === 'file') {
        assert(!!transport.filePath, 'log file path must be provided');
        transport._stream = fs.createWriteStream(transport.filePath, {
          encoding: 'utf8',
          autoClose: true,
          flags: 'a',
        });
        transport._initialFileSize = fs.statSync(transport.filePath).size;
      }
    });
    return this;
  }

  _convertContext(context) {
    return _.map(context, (v, k) => {
      return `${k}=${JSON.stringify(v)}`;
    });
  }

  _formatLog(logObject, logContext, format) {
    //! support format
    return `${logObject._timestamp} [${logObject._level.toUpperCase()}] (${logObject._category})\t${logObject._message}` + `${logContext && _.keys(logContext).length > 0 ? ', ' + this._convertContext(logContext).join(', ') : ''}`;
  }

  _log (level, message, logOptions) {
    const date = new Date();
    const timestamp = this.dateFormat ? dateformat(date, this.dateFormat) : date.toISOString();

    if (this.levels[level] === undefined) {
      level = 'debug';
    }
    logOptions = logOptions || {};

    const loggerCategory = logOptions.category ? this.category + '.' + logOptions.category : this.category;
    const logContext = logOptions.context || {};
    let formattedLoggable;

    let logObject = _.merge({
      _category: loggerCategory,
      _level: level,
      _timestamp: timestamp,
      _message: message,
    }, logContext);

    const logString = this._formatLog(logObject, logContext);

    //!
    _.forEach(this.transports, (transport) => {
      if (this.levels[level] <= this.levels[transport.level]) {
        switch (transport.type) {
          case 'console':
            process.stdout.write(logString + os.EOL);
            break;
          case 'file':
            if (transport._stream) {
              if (transport._initialFileSize + transport._stream.bytesWritten > transport.maxSize * 1024) {
                transport._stream = fs.createWriteStream(transport.filePath, {
                  encoding: 'utf8',
                  autoClose: true,
                  flags: 'w',
                });
                transport._initialFileSize = 0;
              }

              if (transport.writeJson) {
                transport._stream.write(JSON.stringify(logObject) + os.EOL);
              } else {
                transport._stream.write(logString + os.EOL);
              }
            }
            break;
        }
      }
    });
  }

  getChildLogger(category, childContext) {
    const childLogger = {
      log: (level, message, logContext) => {
        this._log(level, message, {
          category: category,
          context: _.merge({}, childContext, logContext),
        });
      }
    };
    _.forEach(this.levels, (index, level) => {
      childLogger[level] = childLogger.log.bind(this, level);
    });
    return childLogger;
  }

  log (level, message, context) {
    this._log(level, message, {
      context
    });
  }
}

module.exports = Logger;