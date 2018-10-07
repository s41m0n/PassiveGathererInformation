/**
 * @file ipSslCertificate.js
 * @module /model/ipSslCertificate
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const mongoose = require('mongoose');

//Schema for a certificate
const IpSslCertificate = new mongoose.Schema({
    //Expiring Date for this certificate
    date: {type: Date, required: true},
    //Ip related to this certificate
    domain: String,
    ip: String,
    //Fingerprint for this certificate (CA Signature)
    fingerprint: {type: String, required: true}
}, {
    versionKey: false
});

IpSslCertificate.index({
    domain: 1,
    ip: 1,
    date: 1,
    fingerprint: 1
});

mongoose.model('IpSslCertificate', IpSslCertificate);