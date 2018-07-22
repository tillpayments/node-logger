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

const stringData = 'a test string';
const numberData = 123.45;
const booleanData = true;
const objectData = { key: 'value', nestedData: { nestedValue: [1, 2, 3] } };
const arrayData = ['foo', 'bar'];

// log level tests
const testLogLevel = (t, level) => {
	const logString = log.buildLogString(level, 'level message', {});
  const timestamp = log.getCurrentTimestamp();
  t.is(logString, `${timestamp} [${level.toUpperCase()}] (main)\tlevel message`);
}

test('log level test - all', testLogLevel, 'all');
test('log level test - debug', testLogLevel, 'debug');
test('log level test - info', testLogLevel, 'info');
test('log level test - warn', testLogLevel, 'warn');
test('log level test - error', testLogLevel, 'error');
test('log level test - fatal', testLogLevel, 'fatal');

// date formatter tests
test('override date formatter static', (t) => {
  log.setDateFormatter(() => 'my-date');
  const logString = log.buildLogString('info', 'foo', {});
  t.is(logString, 'my-date [INFO] (main)\tfoo');
  log.setDateFormatter();
});

test('override date formatter dynamic', (t) => {
  const currentDate = new Date();
  log.setDateFormatter(() => `${currentDate.getTime()}`);
  const logString = log.buildLogString('info', 'foo', {});
  t.is(logString, `${currentDate.getTime()} [INFO] (main)\tfoo`);
  log.setDateFormatter();
});

// log data tests
test('build log string without data', (t) => {
  const logString = log.buildLogString('info', 'foo', {});
  const timestamp = log.getCurrentTimestamp();
  t.is(logString, `${timestamp} [INFO] (main)\tfoo`);
});

test('build log string with string data', (t) => {
  const logString = log.buildLogString('info', 'foo', { data: stringData });
  const timestamp = log.getCurrentTimestamp();
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, ${stringData}`);
});

test('build log string with number data', (t) => {
  const logString = log.buildLogString('info', 'foo', { data: numberData });
  const timestamp = log.getCurrentTimestamp();
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, ${numberData}`);
});

test('build log string with boolean data', (t) => {
  const logString = log.buildLogString('info', 'foo', { data: booleanData });
  const timestamp = log.getCurrentTimestamp();
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, ${booleanData}`);
});

test('build log string with object data', (t) => {
  const logString = log.buildLogString('info', 'foo', { data: objectData });
  const timestamp = log.getCurrentTimestamp();
  /* eslint-disable-next-line quotes */
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, key="value", nestedData={"nestedValue":[1,2,3]}`);
});

test('build log string with array data', (t) => {
  const logString = log.buildLogString('info', 'foo', { data: arrayData });
  const timestamp = log.getCurrentTimestamp();
  /* eslint-disable-next-line quotes */
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, ["foo","bar"]`);
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
