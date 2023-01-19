const { db, dbConfig, dbStream } = require("./db-connector");
const { COLUMN_TYPES, TAB } = require("./gen-table-types");

/**
 * @typedef {{
 * name: string;
 * nullable: boolean;
 * uniqueGroups?: Record<string, string[]>;
 * foreign?: {
 *  table: string;
 *  column: string;
 *  key: string;
 * };
 * type: string;
 * jsType: string;
 * defaultValue?: string;
 * columnType: string;
 * maxLength?: number;
 * possibles?: string[]
 * extra?: string;
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
    /** @type {Record<string, Record<string, Record<string, string[]>>>} */
    const tableUniqueColumns = {};

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
                EXTRA,
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
                extra: EXTRA,
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
                const uniqueTableIndex = tableUniqueIndexes[TABLE_NAME] || (tableUniqueIndexes[TABLE_NAME] = {});
                const uniqueTableColumn = tableUniqueColumns[TABLE_NAME] || (tableUniqueColumns[TABLE_NAME] = {});

                if (!uniqueTableColumn[COLUMN_NAME]) uniqueTableColumn[COLUMN_NAME] = {};
                if (!uniqueTableIndex[INDEX_NAME]) {
                    uniqueTableIndex[INDEX_NAME] = [];
                }

                if (!uniqueTableColumn[COLUMN_NAME][INDEX_NAME]) {
                    uniqueTableColumn[COLUMN_NAME][INDEX_NAME] = uniqueTableIndex[INDEX_NAME];
                }

                uniqueTableIndex[INDEX_NAME].push(COLUMN_NAME);
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
            const tableColumns = tables[TABLE_NAME];

            const column = tableColumns.find((item) => item.name === COLUMN_NAME);
            if (column) {
                column.foreign = {
                    key: COLUMN_NAME,
                    column: REFERENCED_COLUMN_NAME,
                    table: REFERENCED_TABLE_NAME,
                };
            }

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

    for (const table in tableUniqueColumns) {
        const tableColumns = tables[table];
        const tableUnique = tableUniqueColumns[table];

        for (const column in tableUnique) {
            const columnUnique = tableUnique[column];
            const columnTable = tableColumns.find((item) => item.name === column);
            if (columnTable) {
                columnTable.uniqueGroups = columnUnique;
            }
        }
    }

    return { tables, tableIndexes, tableUniqueIndexes, tableUniqueColumns, tableForeigns };
};

module.exports = genTableStruct;
