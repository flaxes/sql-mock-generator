module.exports.getRandomInt = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

/**
 * 
 * @param {string} str 
 * @returns {string}
 */
const camelToSnakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

module.exports.camelToSnakeCase = camelToSnakeCase;
