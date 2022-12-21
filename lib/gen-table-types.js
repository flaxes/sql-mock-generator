// @ts-check

const TAB_SIZE = 4;

module.exports.TAB_SIZE = TAB_SIZE;
module.exports.TAB = " ".repeat(TAB_SIZE);

module.exports.COLUMN_TYPES = {
    tinyint: "number",
    smallint: "number",
    int: "number",
    decimal: "number",
    float: "number",
    double: "number",
    bigint: "string",

    varchar: "string",
    mediumtext: "string",
    longtext: "string",
    text: "string",
    char: "string",

    timestamp: "Date",
    // datetime: 'Date',
    // date: 'Date',
    datetime: "string | Date",
    date: "string | Date",
    time: "string",
};

module.exports.TYPE_SIZE = {
    TINYINT: {
        bytes: 1,
        min: -128,
        max: 127,
        minUnsigned: 0,
        maxUnsigned: 255,
    },
    SMALLINT: {
        bytes: 2,
        min: -32768,
        max: 32767,
        minUnsigned: 0,
        maxUnsigned: 65535,
    },
    MEDIUMINT: {
        bytes: 3,
        min: -8388608,
        max: 8388607,
        minUnsigned: 0,
        maxUnsigned: 16777215,
    },
    INT: {
        bytes: 4,
        min: -2147483648,
        max: 2147483647,
        minUnsigned: 0,
        maxUnsigned: 4294967295,
    },
    /** do not use mysql's bigint with js number. use js BigInt instead */
    BIGINT: {
        bytes: 8,
        min: -2147483648,
        max: 2147483647,
        minUnsigned: 0,
        maxUnsigned: 4294967295,
    },
};
