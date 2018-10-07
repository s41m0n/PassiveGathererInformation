/**
 * @file finder.js
 * @module lib/task/finder
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const mongoose = require('mongoose');
const Task = require('./task');
const logger = require('../logger');
const utility = require('../utility');

//Finder task, used to query DB
class Finder extends Task {

    constructor(settings) {
        super(settings);
        //By the parameter in settings, it build up a specific query
        this.query = {};
        if(utility.isIp(this.settings.target)) {
            if(this.settings.collection === 'DomainResolution') this.query.a = this.settings.target;
            else this.query.ip = this.settings.target;
        }
        else this.query.domain = this.settings.target;
        if(this.settings.date) {
            if (settings.allFromDate) this.query.date = {"$gte": this.settings.date};
            else this.query.date = {"$gte": this.settings.date, "$lt": utility.getDateEndDayFromDate(this.settings.date)}
        }
    }

    _doWork() {
        //Query the specific collection of the DB, printing the result/s
        return mongoose.model(this.settings.collection).find(this.query).lean()
            .then(result => {
                if (result.length) console.log(result);
                else logger.info('NOT FOUND!');
            });
    }

}

module.exports = Finder;