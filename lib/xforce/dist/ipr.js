"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const request = require("request");
class IPR {
    /**
     * Creates an IPR object
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
     * Get IP Address Threat Intelligence
     * @param {string} ipAddress - IPv4/IPv6 Address to get threat intelligence for
     * @returns {Promise<T>}
       */
    get(ipAddress) {
        return new Promise((resolve, reject) => {
            this.request({
                uri: `/ipr/${ipAddress}`
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
exports.IPR = IPR;
