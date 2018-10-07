/**
 * @file whoisProducerCymru.js
 * @module taskWrite/whoisProducerCymru
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const Task = require('../lib/task/task');
const mongoose = require('mongoose');
const Whois = mongoose.model('Whois');
const IPv4 = mongoose.model('IPv4');
const logger = require('../lib/logger');
const async = require('async-p');
const NetcatClient = require('netcat/client');
const utility = require('../lib/utility');

//Class to resolve the Whois using Team Cymru's server.
class WhoisProducerCymru extends Task {

    constructor(settings) {
        super(settings);
        this.nc = new NetcatClient();
    }

    //Every time before contacting the server, a list of all ips is built and send to the server
    //using netcat as specified by server's owner.
    buildAndSendIps(ips) {
        return new Promise(resolve => {
            let buffer = 'begin\nverbose\n';
            return async.each(ips, value => buffer += value.ip + "\n")
                .then(() => {
                    buffer += "end";
                    let serverResponse = [];
                    this.nc.addr('whois.cymru.com').port(43).connect().send(buffer)
                        .on('data', response => {
                            serverResponse.push(response);
                        })
                        .on('error', err => {
                            logger.error({err: err}, 'Error with server');
                        })
                        .on('end', () => {
                            resolve(serverResponse);
                        })
                })
        })
            //When server has finished to send responses, the output is elaborated
            .then(serverResponse => {
                return this.parseData(Buffer.concat(serverResponse).toString());
            });

    }

    //Method to parse the data received from server
    //Data match an exact pattern which can use to split response and create our record to insert into DB
    parseData(serverResponse) {
        return async.each(serverResponse.split("\n"), line => {
            line = line.split("|").map(function (item) {
                return item.trim();
            });
            if (line.length > 1) {
                let whoisToSave = new Whois({
                    date: utility.getNowDate(),
                    ip: line[1],
                    organization: line[6],
                    location: line[3]
                });
                return utility.validateDocument(whoisToSave)
                    .then(() => {
                        return Whois.findOneAndUpdate({
                            ip: whoisToSave.ip,
                            organization: whoisToSave.organization,
                            date: {"$gte": utility.getDateStartDay(), "$lt": utility.getDateEndDay()},
                        }, {
                            $setOnInsert: {
                                location: whoisToSave.location
                            },
                            $max: {
                                date: whoisToSave.date
                            },
                        }, {
                            upsert: true
                        }).lean()
                            .then(res => {
                                if (res) logger.info({whoisOf: whoisToSave.ip}, 'Already present');
                                else logger.info({whoisOf: whoisToSave.ip}, 'Inserted new Whois');
                            })
                            .catch(err => {
                                logger.error({err: err}, 'Error while inserting Whois');
                            });
                    })
                    .catch(err => logger.error({err: err}, 'Error while validating'));
            }
        })
    }

    _doWork() {
        return IPv4.find().lean()
            .then(ips => {
                logger.info({count: ips.length}, 'Resolving Whois');
                return this.buildAndSendIps(ips.map(value => ({
                    ip: value.ip
                })));
            })
    }

}

module.exports = WhoisProducerCymru;
