import test from 'ava';
import nodeLogger from '../index';

const log = nodeLogger({
  transports: [{
    type: 'file',
    level: 'all',
    maxSize: 10,
    filePath: './rotation.log',
  }],
});


