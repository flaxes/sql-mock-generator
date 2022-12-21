// @ts-check

module.exports.getRandomInt = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};
