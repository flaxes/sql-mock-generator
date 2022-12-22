const fs = require("fs");

module.exports = (obj, filePath) => {
    // const realPath = path.resolve(__dirname, filePath);
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 4));
};
