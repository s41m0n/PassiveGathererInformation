/**
 * @file suricataConsumer.js
 * @module taskWrite/suricataConsumer
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const mongoose = require('mongoose');
const Consumer = require('../lib/task/consumer');
const DomainResolution = mongoose.model('DomainResolution');
const Domain = mongoose.model('Domain');
const IPv4 = mongoose.model('IPv4');
const utility = require('../lib/utility');
const async = require('async-p');

//SuricataConsumer, class for read and elaborate data from a log.
class SuricataConsumer extends Consumer {
    constructor(settings) {
        super(settings);
        //Regular expression to match the lines
        this.regExr = /\s+\[\*\*]\s+/;
        let allTypes = '(';
        this.settings.rrtype.forEach(rr => allTypes += (rr + '|'));
        allTypes = allTypes.substring(0, allTypes.length - 1) + ')';
        this.regRrtype = new RegExp('\\b' + allTypes + '\\b');
    }

    //Function to read from stream and save into DB
    computeResult(toInsert) {
        if (toInsert) {
            let arrayOfResolutions = [];
            let arrayOfIps = [];
            let arrayOfDomains = [];
            //Foreach line read check it, then store into DB and then empty the array
            return async.each(toInsert, t => this.checkMatch(t, arrayOfResolutions, arrayOfIps, arrayOfDomains))
                .then(() => {
                    //Inserting at the same time -DomainResolution -Domain -Ip discovered reading the log.
                    return async.parallel([
                        () => utility.bulkSuricata(DomainResolution.collection, arrayOfResolutions),
                        () => utility.bulkInsert(Domain.collection, arrayOfDomains),
                        () => utility.bulkInsert(IPv4.collection, arrayOfIps)
                    ]);
                })
        }
    }

    //Function to check and elaborate the match
    checkMatch(line, arrayOfResolutions, arrayOfIps, arrayOfDomains) {
        return new Promise((resolve) => {
            line = line.split(this.regExr);
            //If matched, split it in order to get an array with values you're interested in
            if (line[1][0] === "R" && this.regRrtype.exec(line[3])) resolve(line);
            resolve();
        })
            .then(line => {
                if (line) {
                    line[3] = line[3].toLowerCase();
                    arrayOfDomains.push(new Domain({domain: line[2]}));
                    if (line[3] === 'a') arrayOfIps.push(new IPv4({ip: line[5]}));
                    arrayOfResolutions.push(new DomainResolution({
                        date: utility.getDateFromString(line[0].substr(0, 23), "MM/DD/YYYY-hh:mm:ss.SSS"),
                        domain: line[2],
                        [line[3]]: [line[3]][0] === 'mx' ? {exchange: line[5]} : line[5]
                    }));
                }
            });
    }
}

module.exports = SuricataConsumer;
