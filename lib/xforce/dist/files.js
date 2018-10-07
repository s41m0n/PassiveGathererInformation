"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const request = require("request");
const fs = require("fs");
class Files {
    /**
     * Creates an File Analysis object
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
    getIntel(filePath) {
        return new Promise((resolve, reject) => {
            if (filePath) {
                let formData = {
                    "file": fs.createReadStream(filePath)
                };
                this.request({
                    method: "POST",
                    uri: "/files",
                    formData: formData,
                    json: true
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(body);
                    }
                });
            }
        });
    }
}
exports.Files = Files;
