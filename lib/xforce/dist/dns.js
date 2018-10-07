"use strict";

let _createClass = function () { function defineProperties(target, props) { for (let i = 0; i < props.length; i++) { let descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

let config_1 = require("./config");
let request = require("request");

let DNS = function () {
  /**
   * Creates a Whois object
   * @param {string} username - XFE API Username
   * @param {string} password - XFE API Password
   */

  function DNS(username, password) {
    _classCallCheck(this, DNS);

    this.request = request.defaults({
      baseUrl: config_1.apiUrl,
      auth: {
        user: username,
        pass: password
      }
    });
  }
  /**
   * Get WHOIS Record Threat Intelligence
   * @param {string} ipAddress/domain - IPv4/IPv6 Address / Domain to get threat intelligence for
   * @returns {Promise<T>}
   */


  _createClass(DNS, [{
    key: "get",
    value: function get(ipAddress) {
      let _this = this;

      return new Promise(function (resolve, reject) {
        _this.request({
          uri: "/resolve/" + ipAddress
        }, function (error, response, body) {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
      });
    }
  }]);

  return DNS;
}();

exports.DNS = DNS;
