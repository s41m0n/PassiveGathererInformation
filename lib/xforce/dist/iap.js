"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const request = require("request");
class IAP {
    /**
     * Creates an IAP object
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
     * Get IAP Address Threat Intelligence
     * @param {string} appName - App Name (like facebook) to get threat intelligence for
     * @returns {Promise<T>}
     * @example
     * // Returns intelligence about a web app
     * var iapInstance = new IAP("username", "password");
     * IAP.get("facebook").then(function(response) {
     *   console.log(response)
     * });
     */
    get(appName) {
        return new Promise((resolve, reject) => {
            this.request({
                uri: `/app/${appName}`
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
exports.IAP = IAP;
