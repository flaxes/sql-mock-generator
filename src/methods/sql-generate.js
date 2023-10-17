const fs = require("fs");
const { escapeId, escape } = require("mysql2");

const CHECK_FOREIGN = "SET FOREIGN_KEY_CHECKS = ?;\n";

const sqlGenerate = (values, filePath) => {
    const results = [CHECK_FOREIGN.replace("?", "0")];

    for (const [table, rows] of Object.entries(values)) {
        const result = [`# <${table}> mock data`];

        for (const row of rows) {
            console.log(row);
            result.push(`INSERT IGNORE INTO ${escapeId(table)} SET ${escape(row)};`);
        }

        results.push(result.join("\n"));
    }

    results.push("\n", CHECK_FOREIGN.replace("?", "1"));

    const text = results.join("\n\n");
    fs.writeFileSync(filePath, text);

    return results;
};

module.exports = sqlGenerate;
