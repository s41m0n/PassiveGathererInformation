/**
 * @file domainProducer.js
 * @module taskWrite/domainProducer
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const mongoose = require('mongoose');
const Task = require('../lib/task/task');
const Domain = mongoose.model('Domain');
const fs = require('fs');
const utility = require('../lib/utility');
const logger = require('../lib/logger');

//Task for inserting domains into DB
class DomainProducer extends Task {

    constructor(settings) {
        super(settings);
    }

    _doWork() {
        //If a path has been given, look for all domains into that file
        //Else if a domain has been given, add only that one
        if (this.settings.path) return this.addDomainsFromFile(this.settings.path);
        else if (this.settings.domain) return this.addDomain(this.settings.domain);
        else return this._endWork();
    }

    //Method to add all domains contained in the file
    addDomainsFromFile(path) {
        if (this.stopped) return Promise.resolve();
        else return new Promise((resolve, reject) => {
            //Read all file and resolve that promise with all data read splitted by lines
            fs.readFile(path, (err, data) => {
                if (err) reject(err);
                else resolve(data.toString().split('\n').map(v => v.trim()).filter(v => !!v));
            });
        })
            .then(domains => {
                return utility.bulkInsert(Domain.collection, domains.map(d => new Domain({domain: d})));
            })
            .catch(err => logger.error({err: err}, 'Wrong file path'));
    };

    //Method to add a single domain
    addDomain(domain) {
        if (this.stopped) return Promise.resolve();
        else return new Domain({domain: domain}).save()
            .catch(err => {
                if (err.code === 11000) logger.info({domain: domain}, 'Already present');
                else logger.error({err: err}, 'Error while storing result');
            })
    }
}

module.exports = DomainProducer;
