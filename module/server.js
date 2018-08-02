/**
 * a nodejs alapvető működésének gyakorlása
 */

/**
 * a szükséges függőségek beolvasása
 */
const http = require('http');
const zlib = require('zlib');
const Readable = require('stream').Readable;
const Auth = require('./auth');
const queryString = require('querystring');

/**
 * bejelentkező űrlap
 */
const loginContent = `
<!DOCTYPE html>
<html>
    <head>
        <title>Page</title>
    </head>
    <body>
        <h2>Login</h2>
        <p>Pleas add your email and password, for login</p>
        <form method="post">
            <label>Email</label>
            <br>
            <input type="email" name="email" >
            <br>
            <label>Password</label>
            <br>
            <input type="password" name="password" >
            <br>
            <button>Login</button>
        </form>
    </body>
    
</html>

`;

/**
 * http kérések feldolgézása és a megfelelő válasz küldése a kliens számára.
 */
class HTTPResponse {
    /**
     * beállítja az elfogadott url-ek listáját
     * @param req - kérés adatai
     * @param res - a válasz adó objektum
     */
    constructor(req, res) {
        this.req = req;
        this.res = res;
        this.testLogin = {
            id: 33,
            name: 'barmi aron',
            email: 'aron@mail.com',
            password: 'aron'
        };

        this.routes = {
            '/': {name: 'index', guard: true },
            '/login': {name: 'login', guard: false },
            '/logout': {name: 'logout', guard: true },
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
                && postData.email === this.testLogin.email
                && postData.password === this.testLogin.password
            ) {
                user.id = this.testLogin.id;
                user.email = this.testLogin.email;
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
                content = 'Hello in Home!';
                break;
            case 'login':
                content = loginContent;
                break;
            case 'logout':
                content = 'Logout. bye bye!';
                break;
            default:
                return this.send404();
        }

        this.compress(content);
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

}

/**
 * server osztály a keresések és válaszok feldolgozására
 */
class Server {

    /**
     * a konstruktorunk akkor fut le, amikor létrehozunk egy új szerver példányt.
     * most nincs argumentuma, de át is adhatunk neki adatotkat ha épp ezt szeretnénk
     * 1. beállítja a portot, ahol fut majd a nodejs server
     * 2. beállítja a maximumújrapróbálkozások számát, foglalt port esetén
     * 3. beállítja a kezdeti értékét az újrapróbálkozásoknak
     * 4. beállítja az újrapróbálkozások között eltelt időt
     * 5. létrehozza a servert
     * 6. beállítja a hibakezelést
     * 7. elindítja a port figyelését
     */
    constructor() {
        // process.on("exit", (code) => {
        //    console.log(`Process exit code is: ${code}`);
        // });
        //
        // setTimeout( () => {
        //     process.exit();
        // }, 2000);

        this.processArgs();

        this.port = this.argObject.port || 3210;
        this.maxRetry = 7;
        this.retryNum = 0;
        this.retryInterval = 1500;

        this.instance = http.createServer((req, res)=>{
            this.response(req, res);
        });

        this.handleError();

        this.startListening();

    }

    /**
     * Feldolgoza a process argumentumait
     */
    processArgs() {
        this.args = [];
        this.argObject = {};
        let pair = [];

        process.argv.forEach((val, index) => {
           this.args[index] = val;
           if (val.includes('=')) {
               // itt felvagdostam a stringet egy objektummá, majd beleraktam az argobject-be
                pair = val.split('=');
                this.argObject[pair[0]] = pair[1];
           }
        });
    }

    /**
     * Port figyelésének megkezdése
     */
    startListening() {
        this.instance.listen(this.port, () => {
            console.log(`my server listen is port: ${this.port}, process id is: ${process.pid}.`);
        });
    }

    /**
     * Összeállítja a válaszokat a http kérésekhez
     * @param req => Request - ez a kérst tartalmazza
     * @param res=> Response - a válaszadáshoz szükséges objektum
     */
    response(req, res) {
        console.log(`fontosabb requestek:  metódus: ${req.method}, url: ${req.url}, request lekérés időpontja: ${new Date()}, headers: ${req.cookie}`);
        new HTTPResponse(req, res);
    }

    /**
     * hibák kezelése
     * ha aport foglalt, akkor újrapróbálkozik a megadott intervallumonként
     */
    handleError() {
        this.instance.on('error', (e)=>{
           if (e.code === 'EADDRINUSE') {
               this.retryNum++;
               if (this.maxRetry >= this.retryNum) {
                   let to = setTimeout(()=> {
                       clearInterval(to);
                       console.error(`A ${this.port} port használatban van! 
                                        Újrapróbálkozás ${this.retryInterval / 1000} ms múlva.`);
                       this.instance.close();
                       this.startListening();
                   }, this.retryInterval);
               }
           }
        });
    }

}

 new Server(3210);