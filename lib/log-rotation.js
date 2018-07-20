const fs = require('fs');

const sequentialRotation = (filePath, maxIndex) => {
  console.log(`-- sequentialRotation file=${filePath} index=${maxIndex}`)
};

module.exports = {
  sequentialRotation,
};