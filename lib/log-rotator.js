const fs = require('fs');

const sequentialRotation = (filePath, maxIndex) => {
  for (let i = maxIndex; i > 0; i -= 1) {
    const sourceFile = i > 1 ? `${filePath}.${i - 1}` : filePath;
    const targetFile = `${filePath}.${i}`;
    if (fs.existsSync(sourceFile)) fs.copyFileSync(sourceFile, targetFile);
  }
};

const evaluateLogFileRotation = (transport) => {
  /* eslint-disable no-param-reassign */
  if (!transport.initialFileSize) transport.initialFileSize = fs.existsSync(transport.filePath) ? fs.statSync(transport.filePath).size : 1;
  const maxFileSize = transport.maxSize * 1024;
  const currentStreamSize = transport.dataStream ? transport.dataStream.bytesWritten : 0;
  const requireRotation = transport.initialFileSize + currentStreamSize >= maxFileSize;

  // do file rotation if applicable
  if (requireRotation) {
    sequentialRotation(transport.filePath, transport.maxRotation);
    transport.initialFileSize = 1;
  }

  // manage transport file stream
  if (requireRotation || !transport.dataStream) {
    transport.dataStream = fs.createWriteStream(transport.filePath, {
      encoding: 'utf8',
      autoClose: true,
      flags: requireRotation ? 'w' : 'a',
    });
  }
  /* eslint-enable no-param-reassign */
};

module.exports = {
  sequentialRotation,
  evaluateLogFileRotation,
};
