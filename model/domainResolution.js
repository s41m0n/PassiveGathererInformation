/**
 * @file domainResolution.js
 * @module model/domainResolution
 * @author Simone Magnani
 * @version 0.0
 */
'use strict';

const mongoose = require('mongoose');

//Schema for a typical resolution of a Domain
const DomainResolution = new mongoose.Schema({
    //Creation Date
    date: {type: Date, required: true},
    //Domain name
    domain: {type: String, required: true},
    //IPv4 address record -> return IPv4 32bit address, used to link hostname to his IPv4 address
    a: {type: [String], default: null},
    //IPv6 address record -> return IPv6 128bit address, used to link hostname to his IPv6 address
    aaaa: {type: [String], default: null},
    //DNS reference -> delegates a DNS zone to use the given authoritative name servers
    ns: {type: [String], default: null},
    //Text record -> used to transfer information about security, opportunistic encryption, policy framework...
    txt: {type: [String], default: null},
    //Mail Server -> link a domain name to a mail server list (preferences included)
    mx: {
        type: [new mongoose.Schema({
            priority: {type: Number, default: null},
            exchange: {type: String, default: null}
        }, {
            _id: false
        })], default: null
    },
}, {
    versionKey: false
});

DomainResolution.index({
    domain: 1,
    date: 1,
    a: 1
});

mongoose.model('DomainResolution', DomainResolution);
