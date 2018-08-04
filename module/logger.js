/**
 * betöltjük a szükséges modulokat
 */
const fs = require('fs'),
    path = require('path'),
    config = require('./config'),
    Fsm = require('./Fsm');

/**
 * a logger osztály fájlokba loggolja a megadott információt
 */
class Logger {
    /**
     * beállítjuk a logok könyvtárának az elérési útját
     */
    constructor() {}

    log(message) {
        Fsm.writePromise(
            path.join(config.logDirectory, 'log.log'),
            `${new Date()} ${message}\n\r`,
            true
        ).catch((err) => {
            console.error(err);
        });
    }
}

module.exports = new Logger();