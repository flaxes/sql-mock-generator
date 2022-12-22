const getValueForColumn = require("./src/methods/get-value-for-column");

const column = {
    name: "isBanned",
    nullable: true,
    defaultValue: null,
    type: "tinyint",
    jsType: "number",
    columnType: "tinyint unsigned",
    maxLength: null,
    extra: "",
};
const result = getValueForColumn("", column);

console.log(result);
