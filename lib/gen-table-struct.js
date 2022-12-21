// @ts-check

const { db, dbConfig, dbStream } = require("./db-connector");
const { COLUMN_TYPES } = require("./gen-table-types");

/**
 * @typedef {{
 * name: string;
 * nullable: boolean;
 * type: string;
 * jsType: string;
 * defaultValue?: string;
 * columnType: string;
 * maxLength?: number;
 * possibles?: string[]
 * }} InterfaceRowData
 */

const genTableStruct = async (dontStopDb) => {
    console.log("Collecting database structure...");

    /** @type {Record<string, InterfaceRowData[]>} */
    const tables = {};
    /** @type {Record<string, Record<string, string[]>>} */
    const tableIndexes = {};
    /** @type {Record<string, Record<string, string[]>>} */
    const tableUniqueIndexes = {};

    /** @type {Record<string, Record<string, { column: string; foreignColumn: string; foreignTable: string; key: string; }>>} */
    const tableForeigns = {};

    console.log("Collecting database tables...");

    // @ts-ignore
    await dbStream(
        `SELECT *
    FROM information_schema.columns
    WHERE table_schema = ?
    ORDER BY table_name,ordinal_position`,
        [dbConfig.database],
        (row) => {
            const {
                TABLE_NAME,
                COLUMN_NAME,
                IS_NULLABLE,
                DATA_TYPE,
                COLUMN_TYPE,
                COLUMN_DEFAULT,
                CHARACTER_MAXIMUM_LENGTH,
                // EXTRA,
            } = row;

            const table = tables[TABLE_NAME] || (tables[TABLE_NAME] = []);

            /** @type {InterfaceRowData} */
            const val = {
                name: COLUMN_NAME,
                nullable: IS_NULLABLE === "YES",
                defaultValue: COLUMN_DEFAULT, // || EXTRA === "auto_increment" ? EXTRA : void 0,
                type: DATA_TYPE,
                jsType: COLUMN_TYPES[DATA_TYPE] || "unknown",
                columnType: COLUMN_TYPE,
                maxLength: CHARACTER_MAXIMUM_LENGTH,
            };

            if (DATA_TYPE === "enum") {
                val.possibles = COLUMN_TYPE.slice("enum(".length, -1)
                    .split(",")
                    .map((item) => item.slice(1, -1));
            }

            table.push(val);
        }
    );

    console.log("Collecting database indexes...");

    await dbStream(
        `SELECT
    TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = ?`,
        [dbConfig.database],
        (row) => {
            const { TABLE_NAME, INDEX_NAME, COLUMN_NAME, NON_UNIQUE } = row;

            const indexTable = tableIndexes[TABLE_NAME] || (tableIndexes[TABLE_NAME] = {});
            if (!indexTable[INDEX_NAME]) indexTable[INDEX_NAME] = [];

            if (NON_UNIQUE === 0) {
                const uniqueTable = tableUniqueIndexes[TABLE_NAME] || (tableUniqueIndexes[TABLE_NAME] = {});

                if (!uniqueTable[INDEX_NAME]) uniqueTable[INDEX_NAME] = [];
                if (!uniqueTable[COLUMN_NAME]) uniqueTable[COLUMN_NAME] = [];

                uniqueTable[INDEX_NAME].push(COLUMN_NAME);
                uniqueTable[COLUMN_NAME].push(INDEX_NAME);
            }

            indexTable[INDEX_NAME].push(COLUMN_NAME);
        }
    );

    console.log("Collecting database foreign keys...");

    await dbStream(
        `SELECT 
        TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME, REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_SCHEMA = ?`,
        [dbConfig.database],
        (row) => {
            const { TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME } = row;

            const table = tableForeigns[TABLE_NAME] || (tableForeigns[TABLE_NAME] = {});

            table[COLUMN_NAME] = {
                column: COLUMN_NAME,
                foreignColumn: REFERENCED_COLUMN_NAME,
                foreignTable: REFERENCED_TABLE_NAME,
                key: CONSTRAINT_NAME,
            };
        }
    );

    if (!dontStopDb) db.end();

    console.log("Collecting structure finished.");

    return { tables, tableIndexes, tableUniqueIndexes, tableForeigns };
};

module.exports = genTableStruct;
