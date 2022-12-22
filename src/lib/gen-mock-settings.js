
const fs = require('fs');
const path = require('path');
const structPromise = require('../promises/struct-promise');
const FILENAME = '../../mock-settings.json';
const SIZE = process.argv[2];

const genTableMockSettings = async () => {
    console.log('Gen mock settings started');

    let settings;
    let size = Number(SIZE);
    const pathToSettings = path.resolve(__dirname, FILENAME);
    console.log('Path to settings', pathToSettings);

    const createSettings = async () => {
        console.log('Mock settings created.');

        const { tables } = await structPromise;

        settings = {};
        for (const key in tables) {
            settings[key] = size;
        }

        console.log('Gen mock settings finished');
        fs.writeFileSync(path.resolve(__dirname, FILENAME), JSON.stringify(settings, null, 4));

        return settings;
    };

    try {
        if (size) throw new Error('Go to catch block');

        settings = require(pathToSettings);
        console.log('Mock settings loaded...');
    } catch (err) {
        if (!size) size = 1;
        settings = await createSettings();
    }

    console.log('Settings\n', JSON.stringify(settings, null, 4));

    return settings;
};

module.exports = genTableMockSettings;
