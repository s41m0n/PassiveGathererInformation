/**
 * @file logger.js
 * @module lib/logger
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const bunyan = require('bunyan');

//Creating personal logger
const logger = bunyan.createLogger({
    name: 'MyProject',
    streams: [{
        level: 'debug',
        stream: process.stdout
    }],
    serializers: {
        err: bunyan.stdSerializers.err
    }
});

module.exports = logger;

