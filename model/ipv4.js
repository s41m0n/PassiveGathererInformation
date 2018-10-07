/**
 * @file ipv4.js
 * @module model/ipv4
 * @author Simone Magnani
 * @version 0.0
 */
'use strict';

const mongoose = require('mongoose');
//Schema for a simple domain
const IPv4 = new mongoose.Schema({
    //Domain name
    ip: {type: String, required: true},
}, {
    versionKey: false
});

IPv4.index({
    ip: 1,
}, {
    unique: true
});

module.exports = mongoose.model('IPv4', IPv4);