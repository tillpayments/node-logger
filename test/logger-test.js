import test from 'ava';
import nodeLogger from '../index';

const log = nodeLogger({
  transports: [{
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
};

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

// log handler test
test('bad log handler test', (t) => {
  log.addLogHandler('not a function');
  t.is(log.logHandlers.length, 0);
});

test('basic log handler test', (t) => {
  t.plan(6);

  const message = 'test log handler';
  log.addLogHandler((logData) => {
    t.is(logData.category, 'main');
    t.is(logData.message, message);
    t.is(logData.level, 'info');
    t.is(logData.data, arrayData);
  });
  t.is(log.logHandlers.length, 1);

  log.info(message, arrayData);
  log.clearLogHandlers();
  t.is(log.logHandlers.length, 0);
});

test('level log handler test - match', (t) => {
  t.plan(5);

  let called = false;
  const message = 'test log handler';
  log.addLogHandler((logData) => {
    called = true;
    t.is(logData.category, 'main');
    t.is(logData.message, message);
    t.is(logData.level, 'info');
    t.is(logData.data, arrayData);
  }, {
    level: 'info',
  });

  log.info(message, arrayData);
  t.is(called, true);
  log.clearLogHandlers();
});

test('level log handler test - not match', (t) => {
  let called = false;
  const message = 'test log handler';
  log.addLogHandler(() => {
    called = true;
  }, {
    level: 'warn',
  });

  log.info(message, arrayData);
  t.is(called, false);
  log.clearLogHandlers();
});

test('category log handler test - match', (t) => {
  t.plan(5);

  let called = false;
  const message = 'test log handler';
  log.addLogHandler((logData) => {
    called = true;
    t.is(logData.category, 'main');
    t.is(logData.message, message);
    t.is(logData.level, 'info');
    t.is(logData.data, arrayData);
  }, {
    category: 'main',
  });

  log.info(message, arrayData);
  t.is(called, true);
  log.clearLogHandlers();
});

test('category log handler test - not match', (t) => {
  let called = false;
  const message = 'test log handler';
  log.addLogHandler(() => {
    called = true;
  }, {
    category: 'notFound',
  });

  log.info(message, arrayData);
  t.is(called, false);
  log.clearLogHandlers();
});
