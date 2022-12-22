const loadedColumnPreset = require("../custom/column-preset");

try {
    // @ts-ignore
    loadedColumnPreset = require("../custom/column-preset-custom");
} catch (err) {}

module.exports = loadedColumnPreset;
