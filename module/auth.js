/**
 * Függőségek betöltése.
 */
const {Jwt} = require('@coolgk/jwt'),
    Cookies = require('cookies');

/**
 * Authentikációt végző osztály
 * A jwt használja az azonosításra
 */
class Auth {
    /**
     * beállítjuk a süti nevét, a titkos kulcsot és a lejárati időt
     */
    constructor() {
        this.cookieName = 'login';
        this.expire = 60* 60 * 1000; // 60 * 60 * 1000 = 1 hour
        this.jwt = new Jwt({secret:'myAwesomeWebAppForNodeBasic'});
    }

    /**
     * készít egy titkosított tokent a felhasználónak.
     * @param info - Object egy JSON.stringify segítségével átalakítható objektum.
     * @returns {string} jwt token.
     */
    getToken(info) {
        return this.jwt.generate(info, this.expire);
    }

    /**
     * beállít egy jwt tokennel titkosított sütit
     * @param req - Request -  a http kérés
     * @param res - Response - http válasz
     * @param info - Object - a a titkos üzenet
     * @returns {*} visszatér a http válasszal
     */
    setCookies(req, res, info) {
        let cookies = new Cookies(req, res);
        cookies.set(this.cookieName, this.getToken(info));
        return res;
    }

    /**
     * kiléptetés, töröljük a sütit
     * @param req - Request -  a http kérés
     * @param res - Response - http válasz
     * @returns {*} visszatér a http válasszal
     */
    logout(req, res) {
        let cookies = new Cookies(req, res);
        cookies.set(this.cookieName);
        return res;
    }

    /**
     * Ellenőrzi a bejelnetkezés érvényességét.
     * @param req - Request - http kérés
     * @param res - Response - http válasz
     * @returns {Boolean} egy boolean értéket ad vissza
     */
    isAuthenticated(req, res) {
        let cookies = new Cookies(req, res);
        let cookie = cookies.get(this.cookieName);
        let verified = this.jwt.verify(cookie);

        return verified !== false;
    }

    /**
     * visszadja a tikosított infot a tokenből
     * @param req - Request - http kérés
     * @param res - Response - http válasz
     * @returns {Object} egy titoksított információt ad vissza
     */
    getInfo(req, res) {
        let cookies = new Cookies(req, res);
        let cookie = cookies.get(this.cookieName);
        let verified = this.jwt.verify(cookie);
        return verified.data || null;
    }
}

module.exports = new Auth();