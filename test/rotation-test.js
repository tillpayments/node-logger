import test from 'ava';
import nodeLogger from '../index';

const log = nodeLogger({
  transports: [{
    type: 'file',
    level: 'all',
    maxSize: 10,
    maxRotation: 2,
    filePath: './rotation.log',
  }],
});

test('to be added', (t) => {
  log.info('add log rotation test cases');
  t.pass();
});
