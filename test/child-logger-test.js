import test from 'ava';
import nodeLogger from '../index';

const log = nodeLogger({
  transports: [{
    type: 'file',
    level: 'all',
    filePath: './test.log',
  }],
});

const cLog1 = log.getChildLogger('child1');
const cLog2Context = { name: 'c2' };
const cLog2 = log.getChildLogger('child2', cLog2Context);

const message = 'child log message';
const objectData = { key: 'value', nestedData: { nestedValue: [1, 2, 3] } };
const arrayData = ['foo', 'bar'];

test('child logger without context', (t) => {
  t.plan(4);
  log.addLogHandler((logData) => {
    t.is(logData.level, 'info');
    t.is(logData.category, 'child1');
    t.is(logData.message, message);
    t.is(logData.data, objectData);
  });
  cLog1.info(message, objectData);
  log.clearLogHandlers();
});

test('child logger with context', (t) => {
  t.plan(5);
  log.addLogHandler((logData) => {
    t.is(logData.level, 'warn');
    t.is(logData.category, 'child2');
    t.is(logData.message, message);
    t.is(logData.data, arrayData);
    t.is(logData.context, cLog2Context);
  });
  cLog2.warn(message, arrayData);
  log.clearLogHandlers();
});
