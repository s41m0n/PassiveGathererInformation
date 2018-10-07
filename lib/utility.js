/**
 * @file utility.js
 * @module lib/utility
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const logger = require('./logger');
const moment = require('moment');
const async = require('async-p');

//Method to check if a data is iterable (return true if is iterable)
exports.isIterable = (data) => {
    return (data && typeof data[Symbol.iterator] === 'function')
};

//Method to return now date (UTC)
exports.getNowDate = function () {
    return moment.utc().toDate();
};
//Method to return this daily start date (UTC 00:00:00)
exports.getDateStartDay = function () {
    return moment.utc().startOf('day').toDate();
};
//Method to return this daily end date (UTC 23:59:59)
exports.getDateEndDay = function () {
    return moment.utc().endOf('day').toDate();
};
//Method to return the date from a string + format
exports.getDateFromString = function (date, format) {
    return moment.utc(date, format).toDate();
};
//Method to return the start of the day of a particular date
exports.getDateStartDayFromDate = (date) => {
    return moment.utc(date).startOf('day').toDate();
};
//Method to return the end of the day of a particular date
exports.getDateEndDayFromDate = (date) => {
    return moment.utc(date).endOf('day').toDate();
};

//Method to prepare a bulk write (write new if not present)
exports.bulkInsert = function (collection, data) {
    //Check if data is not empty
    if (!data || data.length === 0) {
        return Promise.resolve();
    }
    else {
        return collection.insertMany(data, {
            ordered: false
        })
            .catch(err => {
                if (err.code !== 11000) logger.error({err: err}, 'Error while storing result');
            })
    }
};

//Method to prepare a bulk update (write new if not present)
exports.bulkSuricata = function (collection, data) {
    if (!data || data.length === 0) {
        return Promise.resolve();
    }
    let bulk = collection.initializeUnorderedBulkOp();
    return async.each(data, d => this.validateDocument(d))
        .then(() => {
            return async.each(data, d => bulk.find({
                domain: d.domain,
                date: {"$gte": this.getDateStartDayFromDate(d.date), "$lt": this.getDateEndDayFromDate(d.date)},
                a: {$ne: null}
            }).upsert().update({
                $max: {
                    date: d.date
                },
                $addToSet: {
                    a: {$each: d.a},
                    aaaa: {$each: d.aaaa},
                    ns: {$each: d.ns},
                    mx: {$each: d.mx},
                    txt: {$each: d.txt},
                }
            }))
                .then(() => {
                    return new Promise((resolve, reject) => {
                        bulk.execute((err, res) => err ? reject(err) : resolve(res));
                    })
                        .then(result => {
                            logger.info('Bulk Suricata finished, ModifiedPresent: ' + result.nModified + ' InsertedNew: ' + result.nUpserted + ' NotModifiedPresent: ' + (result.nMatched - result.nModified));
                        })
                        .catch(err => {
                            logger.error({err: err}, "Bulk Error");
                        });
                })
        })
        .catch(err => logger.error({err: err}, 'Error while validating'));
};

//Method used to validate a document before inserting it into DB
exports.validateDocument = function (document) {
    return document.validate().then(err => {
        if (err) throw(err);
    });
};

//Method to check if a target is an Ipv4 address.
exports.isIp = function(target) {
    return !!/\d+.\d+.\d+.\d+/.exec(target);
};