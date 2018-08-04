/**
 * betöltjük a szükséges modulokat
 */
const fs = require('fs'),
    path = require('path'),
    config = require('./config')

/**
 * a logger osztály fájlokba loggolja a megadott információt
 */
class Logger {
    /**
     * beállítjuk a logok könyvtárának az elérési útját
     */
    constructor() {}

    log(message) {
        fs.writeFile(
            path.join(config.logDirectory, 'log.log'),
            `${new Date()} ${message}\n\r`,
            {encoding: 'utf8', flag: 'a'},
            (err) => {
                if (err) {
                    console.error('Logger error: ', err);
                }
            }
        );
    }
}

module.exports = new Logger();