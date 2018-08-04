/**
 *  konfigurációs beállítások
 */
const path = require('path');

module.exports = {
    defaultServerPort : 3210,
    logDirectory: path.join(__dirname, 'files/log'),
    htmlDirectory : path.join(__dirname, 'files/html'),
    dbDirectory: path.join(__dirname, 'files/db'),
    testLogin: {
        id: 33,
        name: 'barmi aron',
        email: 'aron@mail.com',
        password: 'aron'
    }
};