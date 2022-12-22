const { db, dbConfig } = require("./lib/db-connector");
const fs = require("fs");
const getValuesForTable = require("./methods/get-values-for-table");
const jsonGenerate = require("./methods/json-generate");
const sqlGenerate = require("./methods/sql-generate");
const structPromise = require("./promises/struct-promise");

async function main() {
    const { tables } = await structPromise;

    const tablesValues = {};

    for (const table in tables) {
        const values = await getValuesForTable(table);

        if (values && values.length) tablesValues[table] = values;
    }

    db.end();

    const DIR = "./results";
    if (!fs.existsSync(DIR)) fs.mkdirSync(DIR);

    jsonGenerate(tablesValues, `${DIR}/result_${dbConfig.database}.json`);
    console.log("JSON created");

    sqlGenerate(tablesValues, `${DIR}/result_${dbConfig.database}.sql`);
    console.log("SQL created");
}

main();
