/**
 * Check this documentation for more useful settings
 *
 * @link [https://fakerjs.dev/api/](API)
 */
const faker = require("faker");
const { getRandomInt } = require("../lib/helpers");

const username = faker.internet.userName;
const zeroOne = () => ~~(Math.random() > 0.5)

module.exports.familiarString = {
    example: () => {
        /**
         * @description
         * Create arrow function with your own logic for any property that start with -
         * a key provided in this familiar list
         * for example column "username" - starts with "user"
         */

        const currentTimestamp = Date.now(); // 1671655177366

        return `example_with_timestamp_${currentTimestamp}`;
    },
    /**
     * For your project - `address` field perhaps *faker.address.streetAddress* value is more suitable
     */
    // address: faker.address.streetAddress,
    address: faker.internet.ip,
    firstname: faker.name.firstName,
    lastname: faker.name.lastName,
    user: username,
    login: username,
    mail: faker.internet.email,
    email: faker.internet.email,
    pass: faker.internet.password,
    name: faker.name.firstName,
    ips: faker.internet.ip,
    ip: faker.internet.ip,
    serverip: faker.internet.ip,
    secret: faker.internet.password,
    modem: () => faker.internet.ip().split(".").slice(-2).join("_"),
    city: faker.address.city,
    country: faker.address.countryCode,
    geo: faker.address.countryCode,
    domain: faker.internet.domainName,
    alias: faker.name.firstName,
    key: () => `${faker.hacker.ingverb()}_${faker.hacker.ingverb()}`,
    value: () => `random_val_${faker.random.word()}`,
    params: faker.datatype.json,
    deleted: zeroOne,
    sql: () => `SELECT ${faker.database.column()} FROM table_${faker.database.column()}`,
};

module.exports.familiarNumber = {
    is_: zeroOne,
    timestamp: () => faker.date.past().getTime(),
    port: faker.internet.port,
    days: () => getRandomInt(7, 60),
    amount: () => Number((Math.random() * 200).toFixed(2)),
    price: () => Number((Math.random() * 200).toFixed(2)),
    httpPort: faker.internet.port,
    socksPort: faker.internet.port,
    has_: zeroOne,
    percent: () => ~~(Math.random() * 101),
    active: zeroOne,
    enabled: zeroOne,
};
