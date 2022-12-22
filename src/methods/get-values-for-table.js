const { getRandomInt } = require("../lib/helpers");
const mockSettingsPromise = require("../promises/mock-settings-promise");
const structPromise = require("../promises/struct-promise");
const uniqueStorage = require("../storages/unique-storage");
const getValueForColumn = require("./get-value-for-column");

const getValuesForTable = async (tableName) => {
    const mockSettings = await mockSettingsPromise;
    const maxId = mockSettings[tableName];
    if (!maxId) return;

    const { tableUniqueIndexes, tables, tableForeigns } = await structPromise;

    const table = tables[tableName];
    const foreigns = tableForeigns[tableName] || {};

    uniqueStorage[tableName] = {};
    const uniqueStore = uniqueStorage[tableName];

    const values = [];

    const getForeignValue = (_columnName, foreignRef) => {
        const foreignMax = mockSettings[foreignRef.foreignTable] || 1;
        const foreignId = getRandomInt(1, foreignMax);

        return foreignId;
    };

    /**
     *
     * @param {import('../lib/gen-table-struct').InterfaceRowData} column
     * @param {(typeof foreigns)[0]} [foreignRef]
     */
    const tryUniqueValue = (column, foreignRef) => {
        let tries = 5;
        const columnName = column.name;
        const previous = uniqueStore[columnName] || (uniqueStore[columnName] = new Set());

        while (tries--) {
            let val;
            if (foreignRef) {
                val = getForeignValue(columnName, foreignRef);
            }

            val = getValueForColumn(tableName, column);

            if (previous.has(val)) {
                // additional check for number
                if (typeof val === "number" && previous.has(++val)) {
                    continue;
                }

                // additional check for string
                if (typeof val === "string") {
                    val = `${getRandomInt(0, 9)}${val}`;
                    if (previous.has(val)) continue;
                }
            }

            previous.add(val);

            return val;
        }
    };

    const getValueForTable = (id) => {
        const obj = {};

        for (const column of table) {
            const columnName = column.name;
            if (columnName === "id") {
                obj.id = id;
                continue;
            }

            const isUnique = !!tableUniqueIndexes[column.name];
            const foreignRef = foreigns[column.name];

            let val;

            if (isUnique) {
                val = tryUniqueValue(column, foreignRef);
            } else if (foreignRef) {
                val = getForeignValue(columnName, foreignRef);
            } else {
                val = getValueForColumn(tableName, column);
            }

            if (val || val !== undefined) {
                obj[columnName] = val;
            }
        }

        return obj;
    };

    for (let id = 1; id < maxId + 1; id++) {
        const val = getValueForTable(id);
        if (val) values.push(val);
    }

    return values;
};

module.exports = getValuesForTable;
