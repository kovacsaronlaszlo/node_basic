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
        this.expire = 60 * 500; // 60 * 500 = 0.5 min
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
     * beállít egy sütit a böngészően
     * @param req - Request -  a http kérés
     * @param res - Response - http válasz
     * @param info - Object - a a titkos üzenet
     * @returns {*} visszatér a válasszal
     */
    setCookies(req, res, info) {
        let cookies = new Cookies(req, res);
        cookies.set(this.cookieName, this.getToken(info));
        return res;
    }

    /**
     * Ellenőrzi a bejelnetkezés érvényességét.
     * @param req - Request - http kérés
     * @param res - Response - http válasz
     */
    isAuthenticated(req, res) {
        let cookies = new Cookies(req, res);
        let cookie = cookies.get(this.cookieName);
        let verified = this.jwt.verify(cookie);

        return verified !== false;
    }
}

module.exports = new Auth();