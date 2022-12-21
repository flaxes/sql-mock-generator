// @ts-check

const faker = require('faker');
const { familiarNumber, familiarString } = require('../column-preset');
const { chance_of_null_value, chance_of_default_value } = require('../lib/config');
const { getRandomInt } = require('../lib/helpers');

/**
 * @param {string} _table - for future purposes
 * @param {Awaited<ReturnType<typeof import('../lib/gen-table-struct')>>['tables'][0][0]} column
 * @returns {string | number | null | Date | undefined}
 */
const getValueForColumn = (_table, column) => {
    if (column.nullable && Math.random() < chance_of_null_value) {
        return null;
    }

    if (column.defaultValue && Math.random() < chance_of_default_value) {
        if (column.defaultValue === 'CURRENT_TIMESTAMP') return;

        return column.defaultValue;
    }

    if (column.possibles) {
        return column.possibles[~~(Math.random() * column.possibles.length)];
    }

    const checkFamliliar = (list) => {
        const name = column.name.toLowerCase().replaceAll('_', '');

        for (const key in list) {
            if (name.startsWith(key)) {
                let res = list[key]();

                if (typeof res === 'string' && column.maxLength) res = res.slice(0, column.maxLength);

                return res;
            }
        }
    };

    const randomDate = () => {
        return new Date(16e11 - 1e11 + Math.random() * 17e10);
    };

    switch (column.jsType) {
        case 'number':
            return checkFamliliar(familiarNumber) || getRandomInt(0, column.maxLength || 50);
        case 'string':
            return checkFamliliar(familiarString) || faker.random.word().slice();
        case 'string | Date':
            return randomDate();
        case 'Date':
            return randomDate();

        default:
            return null;
    }
};

module.exports = getValueForColumn;
