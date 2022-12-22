/**
 * Made for prevent unique data conflicts
 * table -> column -> uniques[]
 * @type {Record<string, Record<string | number, Set<any>>>}
 */
const uniqueStorage = {};

module.exports = uniqueStorage;
