import test from 'ava';
import nodeLogger from '../index';

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

const objectData = { key: 'value', nestedData: { nestedValue: [1, 2, 3] } };
const arrayData = ['foo', 'bar'];

test('override date formatter static', t => {
  log.setDateFormatter((d) => `my-date`);
  const logString = log.buildLogString('info', 'foo', {});
	t.is(logString, 'my-date [INFO] (main)	foo');
  log.log('info', 'override date formatter static');
  log.setDateFormatter();
});

test('override date formatter dynamic', t => {
  const currentDate = new Date();
  log.setDateFormatter((d) => `${currentDate.getTime()}`);
  const logString = log.buildLogString('info', 'foo', {});
	t.is(logString, `${currentDate.getTime()} [INFO] (main)	foo`);
	log.log('info', 'override date formatter dynamic');
  log.setDateFormatter();
});

test('build log string without data', t => {
  const logString = log.buildLogString('info', 'foo', {});
  const timestamp = log.getCurrentTimestamp();
	t.is(logString, `${timestamp} [INFO] (main)	foo`);
  log.log('info', 'build log string without data');
});

test('build log string with object data', t => {
  const logString = log.buildLogString('info', 'foo', { data: objectData });
  const timestamp = log.getCurrentTimestamp();
	t.is(logString, `${timestamp} [INFO] (main)	foo, key="value", nestedData={"nestedValue":[1,2,3]}`);
  log.log('info', 'build log string with object data');
});

log.log('all', 'all message');
log.log('debug', 'debug message');
log.log('info', 'info message');
log.log('warn', 'warn message');
log.log('error', 'error message');
log.log('fatal', 'fatal message');
log.log('fatal', 'fatal message with object', objectData);
log.log('fatal', 'fatal message with array', arrayData);

log.all('all message');
log.debug('debug message');
log.info('info message');
log.warn('warn message');
log.error('error message');
log.fatal('fatal message');
log.fatal('fatal message with object', objectData);
log.fatal('fatal message with array', arrayData);

const cLog = log.getChildLogger('child');
cLog.info('child info message');
cLog.warn('child warn message');
cLog.error('child error message');
cLog.fatal('child fatal message with object', objectData);
cLog.fatal('child fatal message with array', arrayData);


const cLog2 = log.getChildLogger('child2', { name: 'child2' });
cLog2.info('child info message');
cLog2.warn('child warn message');
cLog2.error('child error message');
cLog2.fatal('child fatal message with object', objectData);
cLog2.fatal('child fatal message with array', arrayData);
