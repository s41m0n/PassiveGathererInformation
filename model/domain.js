/**
 * @file domain.js
 * @module model/domain
 * @author Simone Magnani
 * @version 0.0
 */
'use strict';

const mongoose = require('mongoose');
//Schema for a simple domain
const Domain = new mongoose.Schema({
    //Domain name
    domain: {type: String, required: true},
}, {
    versionKey: false
});

Domain.index({
    domain: 1,
}, {
    unique: true
});

module.exports = mongoose.model('Domain', Domain);