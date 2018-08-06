# @tillpayments/node-logger
Message and data logger for nodejs. Features:
- Multiple transport channels
- Child logger with different category name
- Log rotation
- Customised date formatter
- External log handler (data in JSON object)

### Install
```
npm i @tillpayments/node-logger --save
```

### Definitions
Log Levels:
```
LOG_LEVELS = ['all', 'debug', 'info', 'warn', 'error', 'fatal'];
```
Default date display format
```
const leadingZero = value => `0${value}`.slice(-2);
const getDateString = date => `${date.getFullYear()}-${leadingZero(date.getMonth() + 1)}-${leadingZero(date.getDate())}`;
const getTimeString = date => `${date.toTimeString().match(/([\d:]+ [A-Z]+[\+-][0-9]+)/)[1]}`;
const formatTimestamp = date => `${getDateString(date)} ${getTimeString(date)}`;
```

### Usage
``` js
const Logger = require('@tillpayments/node-logger');

/**
 * Create a logger by config object:
 * - category {string} - [optional] logger category name, default to value "main"
 * - transports {array} - array of transport definitions, optional attributes see inline comment
 *   - type: ['file', 'console']
 *   - level: <log_level>
 */
const log = Logger({
  transports: [{
    type: 'console',
    level: 'debug',
  }, {
    type: 'file',
    level: 'debug',
    writeJson: false, // true to wrap whole log line into JSON object
    maxSize: 1000, // 1000 KB per file
    maxRotation: 5, // keep 5 historical rotation logs
    filePath: './test.log',
  }],
});

// data can be: string, number, boolean, array, object
const data = { key: 'value' };

// message is mandatory, data is optional
log.log('all', 'all message', data);
log.log('debug', 'debug message');
log.log('info', 'info message');
log.log('warn', 'warn message');
log.log('error', 'error message');
log.log('fatal', 'fatal message');

log.all('all message', data);
log.debug('debug message');
log.info('info message');
log.warn('warn message');
log.error('error message');
log.fatal('fatal message');
```

Override dateFormatter:
``` js
// set dateFormatter
log.setDateFormatter((d) => `${d.getTime()}`); // where d is a Date object
// remove customised dateFormatter
log.setDateFormatter();
```

Add external handler
``` js
const t = {
  is(value, expected) { console.log(value === expected); },
};
const message = 'some message';
const data = { some: 'data' };
log.addLogHandler((logData) => {
  t.is(logData.category, 'main');
  t.is(logData.message, message);
  t.is(logData.level, 'info');
  t.is(logData.data, data);
}, {
  level: 'info', // optional config, handle specific level and above
  category: 'main', // optional config, handle specific category
});

log.info(message, data);

// clear handlers
log.clearLogHandlers();
```

Create child logger with a different log category
``` js
const cLog = log.getChildLogger('child');

const context = { key: 'value' };
const cLog2 = log.getChildLogger('child', context);

const data = { key: 'value' };
cLog.info('message', data);
cLog2.info('message', data);
```

### Contribute
Source code syntax check
```
npm run lint
```
Unit tests:
```
npm test
```
