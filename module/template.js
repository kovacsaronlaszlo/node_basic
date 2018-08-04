/**
 * modulok betöltése
 */
const fs = require('fs'),
    path = require('path'),
    config = require('./config'),
    Fsm = require('./Fsm');

/**
 *  kiszolgálja a sablonokat
 */
module.exports = class Template {
    constructor() {
        this.layoutPath = path.join(config.htmlDirectory, 'layout.html');
    }

    /**
     *
     * @param filePath - string; a két sablonfájl neve
     * @param callBack - function; ennek adjuk át a tartalmat
     */
    getContent(filePath, callBack) {
        filePath = path.join(config.htmlDirectory, filePath);
        let p1 = Fsm.readPromise(filePath);
        let p2 = Fsm.readPromise(this.layoutPath);
        Promise.all([p1, p2])
            .then((contents) => {
                let content = contents[1].replace(/\#\{content\}/, contents[0]);
                callBack(null, content);
            })
            .catch((err) => {
                console.error(err);
                callBack(err);
            });
    }
}