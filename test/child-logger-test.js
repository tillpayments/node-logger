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
const cLog1 = log.getChildLogger('child1');
const cLog2 = log.getChildLogger('child2', { name: 'c2' });

const objectData = { key: 'value', nestedData: { nestedValue: [1, 2, 3] } };
const arrayData = ['foo', 'bar'];

// child logger without context
//test('child logger without context, log without data', (t) => {
//  const logString = cLog1.buildLogString('info', 'foo', {});
//  const timestamp = cLog1.getCurrentTimestamp();
//  t.pass();
//  t.is(logString, `${timestamp} [INFO] (child1)\tfoo`);
//});
//
//test('child logger without context, log with object data', (t) => {
//  const logString = cLog1.buildLogString('info', 'foo', { data: objectData });
//  const timestamp = cLog1.getCurrentTimestamp();
//  /* eslint-disable-next-line quotes */
//  t.is(logString, `${timestamp} [INFO] (child1)\tfoo, key="value", nestedData={"nestedValue":[1,2,3]}`);
//});
//
//test('build log string with array data', (t) => {
//  const logString = cLog1.buildLogString('info', 'foo', { data: arrayData });
//  const timestamp = cLog1.getCurrentTimestamp();
//  /* eslint-disable-next-line quotes */
//  t.is(logString, `${timestamp} [INFO] (child1)\tfoo, ["foo","bar"]`);
//});

// child logger with context
