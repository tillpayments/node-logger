# @tillpayments/node-logger
Message and data logger for nodejs. Features:
- Multiple transport channels
- Log rotation
- Customised date formatter

### Install
```
npm i @tillpayments/node-logger --save
```

### Definitions
Log Levels:
```
LOG_LEVELS = ['all', 'debug', 'info', 'warn', 'error', 'fatal'];
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

// set dateFormatter:
log.setDateFormatter((d) => `${currentDate.getTime()}`);
// remove customised dateFormatter
log.setDateFormatter();
```

##### create child logger
Create child logger with a different log category
``` js
const cLog = log.getChildLogger('child');

const context = { key: 'value' };
const cLog2 = log.getChildLogger('child', context);

const data = { key: 'value' };
cLog.info('message', data);
cLog2.info('message', data);
```

### Manual Test
```
node test/logger-test.js
```
