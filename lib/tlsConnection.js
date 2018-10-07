/**
 * @file tlsConnection.js
 * @module lib/tlsConnection
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

//Module used to discover the certificate of a domain.
let tls = require('tls');

exports.check = function (url) {
    if (url.length <= 0 || typeof url !== 'string') {
        throw Error("A valid URL is required");
    }

    let options = {
        host: url,
        port: 443,
        rejectUnauthorized: false,
        family: 4,
        renegotiation: false,
        keepAlive: false,
    };

    //If the fingerprint has not been discovered in time, it will throw an error
    return new Promise((resolve, reject) => {
        let fp = '';
        let msg = '';
        let socket = tls.connect(options, () => {
            fp = socket.getPeerCertificate().fingerprint;
            //socket.end();
        });
        socket.on('error', (err) => {
            msg = err;
            socket.destroy();
        });
        socket.once('close', () => {
            if (fp) resolve(fp);
            else reject(msg);
        });
        socket.setTimeout(1000, () => {
            socket.emit('error', new Error('Timeout'));
        });
    });
};