const nodeLogger = require('../index');

const log = nodeLogger({
  transports: [{
    type: 'console',
    level: 'info',
  }, {
    type: 'file',
    level: 'all',
    filePath: './test.log',
  }],
});

const data = { key: 'value', nestedData: { nestedValue: [1, 2, 3] } };

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

const cLog = log.getChildLogger('child');
cLog.info('child info message', data);
cLog.warn('child warn message');
cLog.error('child error message');

const cLog2 = log.getChildLogger('child2', { name: 'child2' });
cLog2.info('child info message', data);
cLog2.warn('child warn message');
cLog2.error('child error message');
