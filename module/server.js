/**
 * a nodejs alapvető működésének gyakorlása
 */

/**
 * a szükséges függőségek beolvasása
 */
const http = require('http');

/**
 * server osztály a keresések és válaszok feldolgozására
 */
class Server {

    /**
     * a konstruktorunk akkor fut le, amikor létrehozunk egy új szerver példányt.
     * most nincs argumentuma, de át is adhatunk neki adatotkat ha épp ezt szeretnénk
     */
    constructor() {
        this.port = 3210;

        this.instance = http.createServer((req, res)=>{
            this.response(req, res);
        });

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
        res.end('hello world. asdf jklé. majom');
    }
}

 new Server(3210);