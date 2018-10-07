/**
 * @file domainResolver.js
 * @module taskWrite/domainResolver
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const mongoose = require('mongoose');
const DomainResolution = mongoose.model('DomainResolution');
const IPv4 = mongoose.model('IPv4');
const Domain = mongoose.model('Domain');
const Task = require('../lib/task/task');
const async = require('async-p');
const utility = require('../lib/utility');
const logger = require('../lib/logger');
const dns = require('dns');

//Task for getting domain resolution
class DomainResolver extends Task {

    constructor(settings) {
        super(settings);
        //Function to parse record and update the resolution to insert
        this.parseRecord = function (rrtype, result, resolution) {
            if (result.length) {
                rrtype = rrtype.toLowerCase();
                resolution[rrtype] = result;
            }
        }
    }

    //Method to resolve the domain
    resolve(domain) {
        if (this.stopped) return Promise.resolve();
        let resolution = new DomainResolution({
            date: utility.getNowDate(),
            domain: domain
        });
        //Resolve all rrtypes
        return async.eachLimit(this.settings.rrtype, rrtype => {
            return new Promise(resolve => {
                dns.resolve(domain, rrtype, (err, addresses) => {
                    if (!err) this.parseRecord(rrtype, addresses, resolution);
                    resolve();
                });
            })
        }, this.settings.parallel)
            .then(() => {
                return async.parallel([
                    () => utility.validateDocument(resolution)
                        .then(() => {
                            let query = {
                                $max: {
                                    date: resolution.date
                                },
                                $addToSet: {}
                            };
                            this.settings.rrtype.forEach(t => {
                                query.$addToSet[t.toLowerCase()] = {$each: resolution[t.toLowerCase()]}
                            });
                            DomainResolution.findOneAndUpdate({
                                domain: resolution.domain,
                                date: {"$gte": utility.getDateStartDay(), "$lt": utility.getDateEndDay()},
                                a: resolution.a.length ? {$ne: []} : []
                            }, query, {
                                upsert: true
                            }).lean()
                                .then(res => {
                                    if (res) logger.info({resolutionOf: domain}, "Already present");
                                    else logger.info({resolutionOf: domain}, "Inserted new ")
                                })
                                .catch(err => {
                                    logger.error({error: err}, 'Error while inserting ' + domain);
                                })
                        })
                        .catch(err => logger.error({err: err}, 'Error validating')),
                    () => {
                        if (resolution.a.length) {
                            return async.each(resolution.a, ip => IPv4.collection.save(new IPv4({ip: ip}))
                                .catch(err => {
                                    if (err.code !== 11000) logger.error({err: err}, 'Error while saving Ipv4');
                                }));
                        }
                    }
                ]);
            })
    }

    _doWork() {
        //If a target is specified, resolve it and add it to the DB
        if (this.settings.domain) return async.parallel([
            () => this.resolve(this.settings.domain),
            () => new Domain({domain: this.settings.domain}).save()
                .catch(err => {
                    if (err.code !== 11000) logger.error({err: err}, 'Error while saving domain');
                })
        ]);
        //Else resolve all domains in the DB
        else return Domain.find().lean()
            .then(domains => {
                logger.info({count: domains.length}, 'Resolving domains');
                return async.eachLimit(domains, d => this.resolve(d.domain), this.settings.parallel)
            });
    }
}

module.exports = DomainResolver;
