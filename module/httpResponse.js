const zlib = require('zlib');
const Readable = require('stream').Readable;
const Auth = require('./auth');
const queryString = require('querystring');
const fs = require('fs'),
    path = require('path'),
    Logger = require('./logger'),
    config = require('./config'),
    Template = require('./template'),
    DB = require('./DB');

/**
 * http kérések feldolgézása és a megfelelő válasz küldése a kliens számára.
 */
module.exports = class HTTPResponse {
    /**
     * beállítja az elfogadott url-ek listáját
     * @param req - kérés adatai
     * @param res - a válasz adó objektum
     */
    constructor(req, res) {
        this.req = req;
        this.res = res;

        Logger.log(`${req.method} url: ${req.url}`);

        this.routes = {
            '/': {name: 'index', guard: true },
            '/login': {name: 'login', guard: false },
            '/logout': {name: 'logout', guard: true },
            '/api/products/1': {name: 'api/products/1', guard: true}
        };

        switch (this.req.method.toLowerCase()) {
            case 'get':
                this.sendResponse();
                break;
            case 'post':
                this.handlePost();
                break;
            default:
                this.send404();
                break;
        }
    }

    /**
     * post kérések feldolgozása
     */
    handlePost() {
        let postData = '',
            user = {};

        this.req.on('data', (chunk) => {
            postData += chunk;
        });
        this.req.on('end', () => {
            postData = queryString.parse(postData);
            if (
                this.req.url === '/login'
                && postData.email === config.testLogin.email
                && postData.password === config.testLogin.password
            ) {
                user.id = config.testLogin.id;
                user.email = config.testLogin.email;
                Auth.setCookies(this.req, this.res, user);
                this.compress('Sikeres belépés!');
            } else {
                this.compress(loginContent);
            }

        });
    }

    /**
     * az url alapján eldönti, hogy milyen választ küldjön a kliensnek
     */
    sendResponse() {
        let page = this.routes[this.req.url],
            content = '';

        if (!page || !page.name) {
            this.send404();
        }

        if (page.guard && !Auth.isAuthenticated(this.req, this.res)) {
            this.send401();
        }

        switch(page.name) {
            case 'index':
                content = 'index.html';
                break;
            case 'login':
                content = 'login.html';
                break;
            case 'logout':
                content =  'logout.html';
                break;
            case 'api/products/1':
                return new DB('products').getOne(1).then( (json) => {
                    this.json(json);
                });
                break;
            default:
                return this.send404();
        }

        new Template().getContent(content, (err, fc) => {
            if (err) {
                console.log(err);
                this.send404();
            } else {
                this.compress(fc);
            }
        });
    }

    /**
     * Küldés előtt tömörítjük az adatokat
     * 1. megvizsgáljuk, hogy milyen tömörítést ismer a böngésző
     * 2. ha támogatja akkor deflate, vagy gzip algoritmussal tömörítünk
     * @param content - a tratalom (string)
     */
    compress(content) {
        let acceptEncoding = this.req.headers['accept-encoding'] || '',
            type = null,
            contentStream = new Readable(); // => olvasható adatforrás

        contentStream._read = () => {};
        contentStream.push(content);
        contentStream.push(null);


        if (/\bdeflate\b/.test(acceptEncoding)) {
            this.res.writeHead(200, { 'Content-Encoding':'deflate' });
            contentStream.pipe(zlib.createDeflate()).pipe(this.res);
        } else if (/\bgzip\b/.test(acceptEncoding)) {
            this.res.writeHead(200, { 'Content-Encoding':'gzip' });
            contentStream.pipe(zlib.createGzip()).pipe(this.res);
        } else {
            this.res.writeHead(200, {});
            contentStream.pipe(this.res);
        }

        // this.res.writeHead(200, {
        //     'Content-Length': Buffer.byteLength(content),
        //     'Content-Type': 'text/html'
        // });
        // this.res.end(content); // ha megadjuk az end-et akkor küldi a választ a kliensnek
    }

    /**
     * 404 hiba üzenet küldése
     */
    send404() {
        let body = `Az oldal nem található!`;
        this.res.writeHead(404, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'text/plain'
        });

        this.res.end(body);
    }

    /**
     * 401 hiba üzenet küldése
     */
    send401() {
        let body = `Jelentkezzen be az oldal használatához a login oldaon!`;
        this.res.writeHead(401, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'text/plain'
        });

        this.res.end(body);
    }

    /**
     * JSON küldése
     */
    json(jsonSource) {
        this.res.writeHead(401, {
            'Content-Length': Buffer.byteLength(jsonSource),
            'Content-Type': 'application/json'
        });

        this.res.end(jsonSource);
    }

};