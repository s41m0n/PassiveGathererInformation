"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const iap_1 = require("./iap");
const ipr_1 = require("./ipr");
const whois_1 = require("./whois");
const url_1 = require("./url");
const collections_1 = require("./collections");
const files_1 = require("./files");
require("babel-polyfill");
class XFE {
    /**
     * Creates an XFE API Binding
     * @param {string} username - XFE API Username
     * @param {string} password - XFE API Password
       */
    constructor(username, password) {
        this.ipr = new ipr_1.IPR(username, password);
        this.url = new url_1.URL(username, password);
        this.whois = new whois_1.WHOIS(username, password);
        this.iap = new iap_1.IAP(username, password);
        this.collections = new collections_1.Collections(username, password);
        this.files = new files_1.Files(username, password);
    }
}
exports.default = XFE;
module.exports = XFE;
