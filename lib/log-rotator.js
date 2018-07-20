const fs = require('fs');

const sequentialRotation = (filePath, maxIndex) => {
  for (let i = maxIndex; i > 0; i--) {
    const sourceFile = i > 1 ? `${filePath}.${i - 1}` : filePath;
    const targetFile = `${filePath}.${i}`;
    if (fs.existsSync(sourceFile)) fs.copyFileSync(sourceFile, targetFile);
  }
};

module.exports = {
  sequentialRotation,
};
