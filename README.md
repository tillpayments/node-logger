# @tillpayments/node-logger
Log message and data in nodejs processes

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
 * - transports {array} - array of transport definitions
 *   - type: ['file', 'console']
 *   - level: <log_level>
 *   - filePath: file log path, only applicable to file type transport
 */
const log = Logger({
  transports: [{
    type: 'console',
    level: 'debug',
  }, {
    type: 'file',
    level: 'debug',
    // filePath: '/tmp/test.log',
    // KB
    writeJson: true,
    maxSize: '2',
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
