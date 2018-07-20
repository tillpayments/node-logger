const os = require('os');
const stream = require('stream');
const assert = require('assert');
const fs = require('fs');
const logRotation = require('./log-rotator');

const LOG_LEVELS = ['all', 'debug', 'info', 'warn', 'error', 'fatal', 'off'];
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

class Logger {
  constructor(config) {
    this.config = config || {};
    this.category = this.config.category || 'main';
    this.level = this.config.level || 'all';
    this.dateFormat = this.config.dateFormat || DATE_FORMAT;
    this.transports = this.config.transports || [];
    if (typeof this.config.dateFormatter === 'function') this.dateFormatter = this.config.dateFormatter;

    LOG_LEVELS.forEach(level => this[level] = this.log.bind(this, level));

    this.init();
  }

  init() {
    this.transports.forEach((transport) => {
      if (transport.type === 'file') {
        assert(transport.filePath, 'log file path must be provided');
        transport.maxSize = transport.maxSize || 1000;
        transport.maxRotation = transport.maxRotation || 5;
        transport.level = transport.level || this.level;
        this.evaluateLogFileRotation(transport);
      }
    });
  }

  evaluateLogFileRotation(transport) {
    if (!transport.initialFileSize) transport.initialFileSize = fs.existsSync(transport.filePath) ? fs.statSync(transport.filePath).size : 1;
    const maxFileSize = transport.maxSize * 1024;
    const currentStreamSize = transport._stream ? transport._stream.bytesWritten : 0;
    const requireRotation = transport.initialFileSize + currentStreamSize >= maxFileSize;
    console.log(` -- ${transport.initialFileSize}, ${currentStreamSize}`);

    // do file rotation if applicable
    if (requireRotation) {
      logRotation.sequentialRotation(transport.filePath, transport.maxRotation);
      transport.initialFileSize = 1;
    }

    // manage transport file stream
    if (requireRotation || !transport._stream) {
      transport._stream = fs.createWriteStream(transport.filePath, {
        encoding: 'utf8',
        autoClose: true,
        flags: requireRotation ? 'w' : 'a',
      });
    }
  }

  setDateFormatter(dateFormatter) {
    if (typeof dateFormatter === 'function') this.dateFormatter = dateFormatter;
    else this.dateFormatter = null;
  }

  getCurrentTimestamp() {
    const date = new Date();
    if (this.dateFormatter) return this.dateFormatter(date);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.toTimeString()}`;
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

  buildLogString(level, message, options) {
    const category = options && options.category ? options.category : this.category;
    const timestamp = this.getCurrentTimestamp();
    const dataString = options && options.data ? `, ${this.convertContext(options.data).join(', ')}` : '';
    return `${timestamp} [${level.toUpperCase()}] (${category})\t${message}${dataString}`;
  }

  execLog(level, message, options) {
    const levelIndex = LOG_LEVELS.indexOf(level);
    if (levelIndex === -1) level = 'all';
    const logString = this.buildLogString(level, message, options);

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
              this.evaluateLogFileRotation(transport);
              if (transport.writeJson) {
                transport._stream.write(JSON.stringify({
                  timestamp: Math.floor(new Date() / 1000),
                  level,
                  category: options.category || this.category,
                  message,
                  data: options.data,
                }) + os.EOL);
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
        const logData = data || context ? Object.assign({}, context, data) : null;
        this.execLog(level, message, { category: category, data: logData });
      }
    };
    LOG_LEVELS.forEach(level => childLogger[level] = childLogger.log.bind(this, level));
    return childLogger;
  }

  log(level, message, data) {
    this.execLog(level, message, { data });
  }
}

module.exports = Logger;
