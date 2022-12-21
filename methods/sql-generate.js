// @ts-check

const fs = require("fs");
const path = require("path");
const { db } = require("../lib/db-connector");

const CHECK_FOREIGN = "SET FOREIGN_KEY_CHECKS = ?;\n";

const sqlGenerate = (values, filePath) => {
    const results = [CHECK_FOREIGN.replace("?", "0")];

    for (const [table, rows] of Object.entries(values)) {
        const result = [`# <${table}> mock data`];

        for (const row of rows) {
            result.push(`INSERT INTO ${db.escapeId(table)} SET ${db.escape(row)};`);
        }

        results.push(result.join("\n"));
    }

    results.push('\n', CHECK_FOREIGN.replace("?", "1"));

    const realPath = path.resolve(__dirname, filePath);
    const text = results.join("\n\n");
    fs.writeFileSync(realPath, text);

    return results;
};

module.exports = sqlGenerate;
