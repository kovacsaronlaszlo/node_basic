/**
 *  konfigurációs beállítások
 */
const path = require('path');

module.exports = {
    defaultServerPort : 3210,
    logDirectory: path.join(__dirname, 'files/log'),
    htmlDirectory : path.join(__dirname, 'files/html'),
    testLogin: {
        id: 33,
        name: 'barmi aron',
        email: 'aron@mail.com',
        password: 'aron'
    }
};