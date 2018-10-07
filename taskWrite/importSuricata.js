/**
 * @file importSuricata.js
 * @module taskWrite/importSuricata
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const Task = require('../lib/task/task');
const logger = require('../lib/logger');
const fs = require('fs');
const SuricataConsumer = require('./suricataConsumer');

//Task producer for a Suricata dns log
class ImportSuricata extends Task {

    constructor(settings) {
        super(settings);
        this.arrayOfPromises = [];
    }

    _doWork() {
        if (!this.settings.path) return Promise.resolve();
        else return this.importLog(this.settings.path);
    }

    importLog(pathToFile) {
        if (this.stopped) return Promise.resolve();
        logger.info({path: pathToFile},'Importing Log');
        return new Promise((resolve, reject) => {
            //ReadStream that reads all files chunks at time
            const readStream = fs.createReadStream(pathToFile);
            //Consumer of that chunks
            let consumer = new SuricataConsumer(this.settings);
            //Read the log piecemeal.
            readStream
                .on('error', (err) => {
                    reject(err);
                })
                //When data available, notify the consumer
                .on('readable', () => {
                    consumer.setReadable(true);
                    //If consumer has finished reading chunks, then recall it for the next one
                    if (!consumer.isDoingSomething()) {
                        consumer.setDoSomething(true);
                        this.arrayOfPromises.push(consumer.start(readStream));
                        consumer.start(readStream).then(null, err => {
                            logger.error({err: err}, 'Error')
                        })
                    }
                })
                .on('end', () => {
                    logger.info('File read and inserted successfully');
                    resolve();
                });
        })
            //Waiting for all promises to be resolved (waiting for the last inserting)
            .then(() => {
                return Promise.all(this.arrayOfPromises);
            })
            .catch(err => {
                logger.error({err: err}, "Error in readStream");
            });
    }
}

module.exports = ImportSuricata;
