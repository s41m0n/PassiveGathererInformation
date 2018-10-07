/**
 * @file certificateProducer.js
 * @module taskWrite/certificateProducer
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const mongoose = require('mongoose');
const IpSslCertificate = mongoose.model('IpSslCertificate');
const Task = require('../lib/task/task');
const utility = require('../lib/utility');
const Domain = mongoose.model('Domain');
const IPv4 = mongoose.model('IPv4');
const logger = require('../lib/logger');
const tlsConnection = require('../lib/tlsConnection');
const async = require('async-p');

//Class for finding fingerprint of a domain
class Try extends Task {

    constructor(settings) {
        super(settings);
    }

    //Method for getting fingerprint
    getFingerprint(target) {
        if (this.stopped) return Promise.resolve();
        return tlsConnection.check(target)
            .then(certificate => {
                return this.insertFP(target, certificate);
            })
            .catch(err => {
                //When an error occur, store an empty fingerprint
                logger.error({err: err}, "Fingerprint of " + target + ' Unavailable');
                return this.insertFP(target, null);
            });
    }

    //Method to insert the FP into the DB
    insertFP(target, fp) {
        let typology;
        if (utility.isIp(target)) typology = 'ip';
        else typology = 'domain';
        let certificateToInsert = new IpSslCertificate({
            [typology]: target,
            fingerprint: fp,
            date: utility.getNowDate()
        });
        return utility.validateDocument(certificateToInsert)
            .then(() => {
                return IpSslCertificate.findOneAndUpdate({
                    [typology]: certificateToInsert[typology],
                    fingerprint: certificateToInsert.fingerprint
                }, {
                    $max: {
                        date: certificateToInsert.date
                    }
                }, {
                    upsert: true
                })
                    .then(res => {
                        if (res) logger.info({fingerprintOf: target}, "Already present (Updated Date)");
                        else logger.info({fingerprintOf: target}, "Inserted new ");
                    })
                    .catch(err => {
                        logger.error({error: err}, 'Error while inserting FP of ' + target);
                    });
            })
            .catch(err => logger.error({err: err}, 'Error while validating'));
    }

    _doWork() {
        //If the name field is not set, then find all resolutions
        if (!this.settings.target)
            return async.parallel([
                () => {
                    return Domain.find().lean()
                        .then(domains => {
                            return async.eachLimit(domains, d => this.getFingerprint(d.domain), this.settings.parallel)
                        })
                },
                () => {
                    return IPv4.find().lean()
                        .then(ips => {
                            return async.eachLimit(ips, i => this.getFingerprint(i.ip), this.settings.parallel)
                        })
                }
            ]);
        else { //else find just that one and store the target into DB
            logger.info({domain: this.settings.target}, 'Looking for Fingerprint');
            return async.parallel([
                () => {
                    if (utility.isIp(this.settings.target))
                        return new IPv4({ip: this.settings.target}).save()
                            .catch(err => {
                                if (err.code !== 11000) logger.error({err: err}, 'Error while saving domain');
                            });
                    else return new Domain({domain: this.settings.target}).save()
                        .catch(err => {
                            if (err.code !== 11000) logger.error({err: err}, 'Error while saving domain');
                        })
                },
                () => this.getFingerprint(this.settings.target)
            ])
        }
    }
}

module.exports = Try;