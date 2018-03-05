# node-logger

## Example
``` js
const logger = require('logger');

const log = logger.createLogger({
  category: 'cashbox',
  dateFormat: 'yyyy-mm-dd\'T\'HH:MM:ssp',
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

log.info('info', {test:'val'})

log.log('error', 'error message');
log.log('warn', 'warning message');
log.log('info', 'info message');
log.log('verbose', 'verbose message');
log.log('debug', 'debug message');
log.log('silogy', 'silogy message');

log.log('info', 'transaction completed', {
transaction: {
  a: 1,
  b: 2,
},
deposits: []
})
log.info('transaction updated', {
message: 'message',
attr1: 'attribute 1',
attr2: 'attribute 2',
});

// logging error
const err = new Error('test error');
log.error('some error', {error: err.toString()});
log.info('some info', {some: 'data', other: {some: null}});

// child logger with context
cl = log.getChildLogger('gps', {gpsId: 'gps01'});
cl.log('info', 'something else', {and: 123, obj: {some: 'object', deeper: {object: 'here'}}});
cl.info('something');
```