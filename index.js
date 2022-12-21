// @ts-check

const { db, dbConfig } = require("./lib/db-connector");
const getValuesForTable = require("./methods/get-values-for-table");
const jsonGenerate = require("./methods/json-generate");
const sqlGenerate = require("./methods/sql-generate");
const structPromise = require("./promises/struct-promise");

async function main() {
    const { tables } = await structPromise;

    const tablesValues = {};

    for (const table in tables) {
        tablesValues[table] = await getValuesForTable(table);
    }

    db.end();

    jsonGenerate(tablesValues, `../result_${dbConfig.database}.json`);
    console.log("JSON created");

    sqlGenerate(tablesValues, `../result_${dbConfig.database}}.sql`);
    console.log("SQL created");
}

main();
