/**
 * middleware a nod_moduls-ban található fájlok kiszolgálására.
 */
const path = require('path'),
    fs = require('fs'),
    typeRegexp = /\/mod(\/.*(json|js|css|map|jpg|jpeg|png|gif|ttf|eot|svg|woff|woff2|otf))/i;

const moduleResolver = (req, res, next) => {
    let isMatch = typeRegexp.test(req.url),
        filePath = '';
    if (isMatch) {
        filePath = path.join(
            __dirname,
            '../node_modules',
            req.url.match(typeRegexp)[1]
        );
        res.sendFile(filePath);
    } else {
        next(); // továbbdobja, ha nem adjuk meg akkor itt megállna az alakamazás
    }

};

module.exports = moduleResolver;