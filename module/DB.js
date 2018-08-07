/**
 * modulok
 */
const fs = require('fs'),
    path = require('path'),
    config = require('./config'),
    Fsm = require('./Fsm');

/**
 * fájl alapú json adatbázis
 */
module.exports = class DB {

    constructor(collection) {
        this.filePath = path.join(config.dbDirectory, collection + '.json');
    }

    getAll() {
        return Fsm.readPromise(this.filePath);
    }

    getOne(id) {
        return new Promise( (resolve, reject)=>{
            Fsm.readPromise(this.filePath).then( (json) => {
                let data = JSON.parse(json);
                let row = {};
                for (let k in data) {
                    if (data[k].id == id) {
                        row = data[k];
                    }
                }
                resolve( JSON.stringify(row));
            });
        });
    }

    /**
     * Kulcsérték párok alapján visszadaja a kereset, dokumentumot.
     * Használata: DB.findOne( {name: 'vasaló'}).then...
     * @param {Object} where - kulcs érték párokban tartalmazza a szűrő feltétlet
     * @returns {Promise<any>} - null az érték ha nem találta, vagy objektum
     */
    findOne(where) {
        return new Promise((resolve, reject) => {
            Fsm.readPromise(this.filePath).then( (json) => {
                let data = JSON.parse(json);
                let hits = [];
                for (let k in data) {
                    hits = [];
                    for (let j in where) {
                        hits.push(data[k][j] == where[j]);
                    }
                    if (hits.indexOf(false) === -1) {
                        return resolve(data[k]);
                    }
                }
                resolve( null);
            });
        });
    }


};
