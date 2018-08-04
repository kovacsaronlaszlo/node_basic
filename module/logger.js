/**
 * betöltjük a szükséges modulokat
 */
const fs = require('fs'),
    path = require('path');

/**
 * a logger osztály fájlokba loggolja a megadott információt
 */
class Logger {
    /**
     * beállítjuk a logok könyvtárának az elérési útját
     */
    constructor() {
        this.logDirectory = path.join(__dirname, 'files/log');
    }

    log(message) {
        fs.writeFile(
            path.join(this.logDirectory, 'log.log'),
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