const faker = require("faker");
const { familiarNumber, familiarString } = require("../promises/load-column-preset");
const { chance_of_null_value, chance_of_default_value, array_with_brackets } = require("../lib/config");
const { getRandomInt, camelToSnakeCase } = require("../lib/helpers");

const IGNORED_DEFAULT_VALUES = ["CURRENT_TIMESTAMP", "auto_increment"];

/**
 * @param {string} _table - for future purposes
 * @param {Awaited<ReturnType<typeof import('../lib/gen-table-struct')>>['tables'][0][0]} column
 * @returns {string | number | null | Date | undefined}
 */
const getValueForColumn = (_table, column) => {
    if (column.defaultValue && Math.random() < chance_of_default_value) {
        const isIgnored =
            IGNORED_DEFAULT_VALUES.includes(column.defaultValue) ||
            (column.extra && IGNORED_DEFAULT_VALUES.includes(column.extra));

        if (isIgnored) {
            return;
        }

        return column.defaultValue;
    }

    if (column.nullable && Math.random() < chance_of_null_value) {
        if (column.defaultValue || column.extra) return;

        return null;
    }

    // Useful for enum
    if (column.possibles) {
        return column.possibles[~~(Math.random() * column.possibles.length)];
    }

    const name = camelToSnakeCase(column.name);
    const isArray = name.endsWith("_array");

    const escapeArray = (array) => {
        let val = JSON.stringify(array);

        if (column.maxLength) {
            val = val.slice(0, column.maxLength);

            if (array_with_brackets) {
                if (!val.endsWith('"]')) {
                    val += val.endsWith('"') ? "]" : '"]';
                }
            } else {
                // Remove first bracket
                val = val.slice(1);

                if (val.endsWith("]")) val = val.slice(0, -1);
                if (!val.endsWith('"')) val += '"';
            }
        }

        return val;
    };

    const checkFamliliar = (list) => {
        const genName = (key) => {
            let res = list[key]();

            if (typeof res === "string" && column.maxLength) res = res.slice(0, column.maxLength);

            return res;
        };

        const genMany = (key) => {
            const L = ~~(Math.random() * 6) + 1;
            const array = [];

            for (let i = 0; i < L; i++) {
                array.push(genName(key));
            }

            return array;
        };

        for (const key in list) {
            if (name.startsWith(key)) {
                if (isArray) {
                    return genMany(key);
                }

                return genName(key);
            }
        }
    };

    const randomDate = () => {
        return new Date(16e11 - 1e11 + Math.random() * 17e10);
    };

    const getResult = () => {
        let val;

        switch (column.jsType) {
            case "number":
                val = checkFamliliar(familiarNumber);
                return typeof val === "number" ? val : getRandomInt(0, column.maxLength || 50);
            case "string":
                val = checkFamliliar(familiarString);

                if (!val) {
                    val = faker.random.word();

                    if (isArray) val = [val];
                }

                if (Array.isArray(val)) val = escapeArray(val);

                return val;
            case "string | Date":
                return randomDate();
            case "Date":
                return randomDate();

            default:
                return null;
        }
    };

    const result = getResult();

    return result;
};

module.exports = getValueForColumn;
