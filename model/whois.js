/**
 * @file whois.js
 * @module /model/whois
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const mongoose = require('mongoose');

//Schema for a certificate
const Whois = new mongoose.Schema({
    //Expiring Date for this certificate
    date: {type: Date, required: true},
    ip: String,
    domain: String,
    organization: {type: String, default: null},
    location: {type: String, default: null},
}, {
    versionKey: false
});

Whois.index({
    ip: 1,
    domain: 1,
    organization: 1
});

mongoose.model('Whois', Whois);