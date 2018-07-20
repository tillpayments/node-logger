const os = require('os');
const stream = require('stream');
const assert = require('assert');
const fs = require('fs');

const LOG_LEVELS = ['all', 'debug', 'info', 'warn', 'error', 'fatal', 'off'];
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class Logger {
  constructor(config) {
    this.config = config || {
      category: 'main',
      level: 'all',
    };

    this.category = this.config.category || 'main';
    this.dateFormat = this.config.dateFormat || DATE_FORMAT;
    this.transports = this.config.transports || [];

    LOG_LEVELS.forEach(level => this[level] = this.log.bind(this, level));

    this.init();
  }

  init() {
    this.transports.forEach((transport) => {
      if (transport.type === 'file') {
        assert(!!transport.filePath, 'log file path must be provided');
        transport._stream = fs.createWriteStream(transport.filePath, {
          encoding: 'utf8',
          autoClose: true,
          flags: 'a',
        });
        transport._stream.on('open', () => {
          transport._initialFileSize = fs.statSync(transport.filePath).size;
        });
      }
    });
  }

  convertContext(context) {
    const values = [];
    for (let key in context) {
      // skip loop if the property is from prototype
      if (!context.hasOwnProperty(key)) continue;
      values.push(`${key}=${JSON.stringify(context[key])}`);
    }
    return values;
  }

  formatLog(logData) {
    const dataString = logData.data ? `, ${this.convertContext(logData.data).join(', ')}` : '';
    return `${logData.timestamp} [${logData.level.toUpperCase()}] (${logData.category})\t${logData.message}${dataString}`;
  }

  _log(level, message, options) {
    const date = new Date();
    const timestamp = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.toTimeString()}`;

    const levelIndex = LOG_LEVELS.indexOf(level);
    if (levelIndex === -1) level = 'all';

    const logString = this.formatLog({
      category: options.category || this.category,
      level,
      timestamp,
      message,
      data: options.data,
    });

    // log per transport
    this.transports.forEach((transport) => {
      const tpLogLevelIndex = LOG_LEVELS.indexOf(transport.level);
      if (levelIndex >= tpLogLevelIndex) {
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
                transport._stream.write(JSON.stringify(logData) + os.EOL);
              } else {
                transport._stream.write(logString + os.EOL);
              }
            }
            break;
        }
      }
    });
  }

  getChildLogger(category, context) {
    const childLogger = {
      log: (level, message, data) => {
        this._log(level, message, {
          category: category,
          data: Object.assign({}, context, data),
        });
      }
    };
    LOG_LEVELS.forEach(level => childLogger[level] = childLogger.log.bind(this, level));
    return childLogger;
  }

  log(level, message, data) {
    this._log(level, message, { data });
  }
}

module.exports = Logger;
