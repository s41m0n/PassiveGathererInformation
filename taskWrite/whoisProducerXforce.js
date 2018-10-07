/**
 * @file whoisProducerXforce.js
 * @module taskWrite/whoisProducerXforce
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const xforce = require('../lib/xforce');
const Task = require('../lib/task/task');
const mongoose = require('mongoose');
const Whois = mongoose.model('Whois');
const Domain = mongoose.model('Domain');
const logger = require('../lib/logger');
const async = require('async-p');
const utility = require('../lib/utility');

//Class used to discover Whois record using XFORCE
class WhoisProducerXForce extends Task {

    constructor(settings) {
        super(settings);
        //Connection to the server
        this.xfeClient = new xforce(this.settings.key, this.settings.pass);
    }

    getWhois(target) {
        if (this.stopped) return Promise.resolve();
        //Contacting the server for a specific target
        else return this.xfeClient.whois.get(target)
            .then(response => {
                response = JSON.parse(response);
                if (response.hasOwnProperty('contact')) {
                    let typology;
                    if (utility.isIp(target)) typology = 'ip';
                    else typology = 'domain';
                    //Check if the record contains contacts field, if not a null organization is inserted
                    let whoisToInsert = new Whois({
                        date: utility.getNowDate(),
                        location: response.contact[0].country || null,
                        organization: response.contact[0].organization || response.contact[0].name || null,
                        [typology]: target
                    });
                    return utility.validateDocument(whoisToInsert)
                        .then(() => {
                            return Whois.findOneAndUpdate({
                                [typology]: whoisToInsert[typology],
                                organization: whoisToInsert.organization
                            }, {
                                $max: {
                                    date: whoisToInsert.date
                                },
                                $setOnInsert: {
                                    location: whoisToInsert.location
                                }
                            }, {
                                upsert: true
                            }).lean()
                                .then(res => {
                                    if (res) logger.info({[typology]: target}, 'Already present');
                                    else logger.info({[typology]: target}, 'Inserted new Whois');
                                })
                                .catch(err => {
                                    logger.error({err: err}, 'Error while inserting Whois');
                                });
                        })
                        .catch(err => logger.error({err: err}, 'Error while validating'));

                } else {
                    throw('No contacts for ' + target);
                }
            })
            .catch(err => {
                logger.error({err: err});
            })
    }

    _doWork() {
        if (this.settings.target) return this.getWhois(this.settings.target);
        else return Domain.find().lean()
            .then(domains => {
                logger.info({count: domains.length}, 'Resolving Whois');
                return async.eachLimit(domains, d => this.getWhois(d.domain), this.settings.parallel)
            })
    }

}

module.exports = WhoisProducerXForce;
