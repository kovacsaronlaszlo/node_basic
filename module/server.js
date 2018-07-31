/**
 * a nodejs alapvető működésének gyakorlása
 */

/**
 * a szükséges függőségek beolvasása
 */
const http = require('http');

/**
 * bejelentkező űrlap
 */
const loginContent = `
<!DOCTYPE html>
<html>
    <head>
        <title>Oldal</title>
    </head>
    <body>
        <h2>Belépés</h2>
        <p>kérem adja meg az adatait a belépéshez</p>
        <form method="post">
            <label>Email</label>
            <br>
            <input type="email" name="email" >
            <br>
            <label>Password</label>
            <br>
            <input type="password" name="password" >
            <button>Belépés</button>
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

        this.routes = {
            '/': 'index',
            '/login': 'login',
            '/logout': 'logout'
        };

        this.sendResponse();
    }

    /**
     * az url alapján eldönti, hogy milyen választ küldjön a kliensnek
     */
    sendResponse() {
        let page = this.routes[this.req.url],
            content = '';

        switch(page) {
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

        this.res.writeHead(200, {
            'Content-Length': Buffer.byteLength(content),
            'Content-Type': 'text/html'
        });
        this.res.end(content);
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
        this.port = 3210;
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
     * Port figyelésének megkezdése
     */
    startListening() {
        this.instance.listen(this.port, () => {
            console.log(`my server listen is port: ${this.port}.`);
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