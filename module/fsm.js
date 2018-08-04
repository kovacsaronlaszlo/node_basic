/**
 * modulok
 */
const fs = require('fs'),
    path = require('path'),
    config = require('./config');

class Fsm {

    /**
     * fájlok olvasása promise egítségével
     * @param filePath string - a fájl elérési módja
     * @returns {Promise<any>}
     */
    readPromise(filePath) {
        return new Promise( (resolve, reject)=> {
            fs.readFile(filePath, 'utf8', (err, content)=> {
                if (err) {
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });
    }

    /**
     * fájlok írása promise segítségével
     * @param filePath - string; file elérési útja
     * @param content - string; fájl tartalma
     * @param append - boolean, hozzáfűzés
     * @returns {Promise<any>}
     */
    writePromise(filePath, content, append = false) {
        return new Promise( (resolve, reject)=> {
            fs.writeFile(
                filePath,
                content,
                {
                    encoding: 'utf8',
                    flag: append ?'a' : 'w'
                },
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(); // írásnál nem kapunk vissza tartalmat
                    }
                }
            );
        });
    }
};

module.exports = new Fsm();