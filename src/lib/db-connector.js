
const mysql2 = require("mysql2");

/** @type {import('mysql2').ConnectionOptions} */
const config = require("../../config.json").database;

const db = mysql2.createPool(config);

module.exports.db = db;
module.exports.dbConfig = config;
module.exports.dbStream = (sql, values, cb) => {
    const query = db.query(sql, values);
    const stream = query.stream({});

    const promise = new Promise((resolve, reject) => {
        stream.on("error", (err) => reject(err));
        // @ts-ignore
        stream.on("data", (row) => cb(row));
        stream.on("end", (end) => resolve(end));
    });

    return promise;
};
