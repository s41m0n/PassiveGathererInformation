"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const request = require("request");
class URL {
    /**
     * Creates an URL object
     * @param {string} username - XFE API Username
     * @param {string} password - XFE API Password
     */
    constructor(username, password) {
        this.request = request.defaults({
            baseUrl: config_1.apiUrl,
            auth: {
                user: username,
                pass: password
            }
        });
    }
    /**
     * Get URL Threat Intelligence
     * @param {string} url - URL to search for
     * @returns {Promise<T>} Returns a promise with the response
       */
    get(url) {
        return new Promise((resolve, reject) => {
            this.request({
                uri: `/url/${url}`
            }, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(body);
                }
            });
        });
    }
}
exports.URL = URL;
