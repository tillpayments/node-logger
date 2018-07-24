import test from 'ava';
import nodeLogger from '../index';
import dataFormatter from '../lib/data-formatter';

const log = nodeLogger({
  transports: [{
    type: 'file',
    level: 'all',
    filePath: './test.log',
  }],
});

const category = 'main';
const sampleData = ['foo', 'bar'];
const date = new Date();
const timestamp = dataFormatter.formatTimestamp(date);

// log level tests
const testLogLevel = (t, level) => {
  t.plan(4);

  let called = false;
  const message = 'test log handler';
  log.addLogHandler((logData) => {
    called = true;
    t.is(logData.category, category);
    t.is(logData.message, message);
    t.is(logData.level, level);
  });

  log[level](message);
  t.is(called, true);
  log.clearLogHandlers();
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
  const logString = log.buildLogString({
    level: 'info',
    category,
    message: 'foo',
  });
  t.is(logString, 'my-date [INFO] (main)\tfoo');
  log.setDateFormatter();
});

test('override date formatter dynamic', (t) => {
  log.setDateFormatter(d => `${d.getTime()}`);
  const logString = log.buildLogString({
    date,
    level: 'info',
    category,
    message: 'foo',
  });
  t.is(logString, `${date.getTime()} [INFO] (main)\tfoo`);
  log.setDateFormatter();
});

// log string format tests
test('build log string without data', (t) => {
  const logString = log.buildLogString({
    date,
    level: 'info',
    category,
    message: 'foo',
  });
  t.is(logString, `${timestamp} [INFO] (main)\tfoo`);
});

test('build log string with string data', (t) => {
  const stringData = 'test string';
  const logString = log.buildLogString({
    date,
    level: 'info',
    category,
    message: 'foo',
    data: stringData,
  });
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, test string`);
});

test('build log string with number data', (t) => {
  const numberData = 123.45;
  const logString = log.buildLogString({
    date,
    level: 'info',
    category,
    message: 'foo',
    data: numberData,
  });
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, 123.45`);
});

test('build log string with boolean data', (t) => {
  const booleanData = true;
  const logString = log.buildLogString({
    date,
    level: 'info',
    category,
    message: 'foo',
    data: booleanData,
  });
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, true`);
});

test('build log string with object data', (t) => {
  const objectData = { key: 'value', nestedData: { nestedValue: [1, 2, 3] } };
  const logString = log.buildLogString({
    date,
    level: 'info',
    category,
    message: 'foo',
    data: objectData,
  });
  /* eslint-disable-next-line quotes */
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, key="value", nestedData={"nestedValue":[1,2,3]}`);
});

test('build log string with array data', (t) => {
  const arrayData = ['foo', 'bar'];
  const logString = log.buildLogString({
    date,
    level: 'info',
    category,
    message: 'foo',
    data: arrayData,
  });
  /* eslint-disable-next-line quotes */
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, ["foo","bar"]`);
});

test('build log string with array data and extra context', (t) => {
  const context = { key: 'value' };
  const arrayData = ['foo', 'bar'];
  const logString = log.buildLogString({
    date,
    level: 'info',
    category,
    message: 'foo',
    context,
    data: arrayData,
  });
  /* eslint-disable-next-line quotes */
  t.is(logString, `${timestamp} [INFO] (main)\tfoo, key="value", ["foo","bar"]`);
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
    t.is(logData.data, sampleData);
  });
  t.is(log.logHandlers.length, 1);

  log.info(message, sampleData);
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
    t.is(logData.data, sampleData);
  }, {
    level: 'info',
  });

  log.info(message, sampleData);
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

  log.info(message, sampleData);
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
    t.is(logData.data, sampleData);
  }, {
    category: 'main',
  });

  log.info(message, sampleData);
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

  log.info(message, sampleData);
  t.is(called, false);
  log.clearLogHandlers();
});
