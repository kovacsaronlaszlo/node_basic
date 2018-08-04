/**
 * a nodejs alapvető működésének gyakorlása
 */

/**
 * a szükséges függőségek beolvasása
 */
const http = require('http');
const HTTPResponse = require('./httpResponse');


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