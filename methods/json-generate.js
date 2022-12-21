// @ts-check

const fs = require('fs');
const path = require('path');

module.exports = (obj, filePath) => {
    const realPath = path.resolve(__dirname, filePath);
    fs.writeFileSync(realPath, JSON.stringify(obj, null, 4));
};
