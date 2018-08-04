/**
 * modulok betöltése
 */
const fs = require('fs'),
    path = require('path'),
    config = require('./config');

/**
 *  kiszolgálja a sablonokat
 */
module.exports = class Template {
    constructor() {}

    getContent(filePath, callBack) {
        filePath = path.join(config.htmlDirectory, filePath);

        // fs.readFile(filePath, 'utf8', (err, content) => {
        //    if (err) {
        //        callBack(err);
        //    } else {
        //        callBack(content);
        //    }
        // });
        fs.readFile(filePath, 'utf8', callBack);
    }
}