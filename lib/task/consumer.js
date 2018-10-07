/**
 * @file consumer.js
 * @module lib/consumer
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

const Task = require('./task');

//Class for a stream consumer.
class Consumer extends Task {

    constructor(settings) {
        super(settings);
        //Variable, indicates if this task is doing something
        this.doSomething = false;
        //Variable, indicates if stream is ready to be read
        this.readable = false;
        //In case you read half of a line, this variable stores it
        this.bufferRemainder = '';
    }

    readFromStream(stream) {
        if (this.stopped) return Promise.resolve();
        return new Promise((resolve) => {
            let tmp;
            //read and concat into bufferRemainder
            while (null !== (tmp = stream.read())) {
                this.bufferRemainder += tmp.toString();
            }
            //set readable at false because now it elaborates data
            this.readable = false;
            //if false, it reached EOF
            if (this.bufferRemainder.length) {
                tmp = this.bufferRemainder.split("\n");
                //if last element length is equal 0, then there's no bufferRemainder, write all
                if (tmp[tmp.length - 1].length === 0) {
                    this.bufferRemainder = '';
                } else { //Else store last element and write others
                    this.bufferRemainder = tmp[tmp.length - 1];
                }
                tmp = tmp.splice(0, tmp.length - 1);
                //Call to the check and insert into database
                resolve(tmp);
            }
            resolve();
        })
    }

    //Each class which extends Consumer must Override this method.
    //This is the method to elaborate data, it is class-dependent
    computeResult(result) {
    }

    start(stream) {
        if (!this.readable) return Promise.resolve(this._endWork());
        else return Promise.resolve(this._doWork(stream));
    }

    //Method to set the variable isDoingSomething to true/false
    setDoSomething(booleanValue) {
        this.doSomething = booleanValue;
    }

    //Method to set the variable isReadable to true/false
    setReadable(booleanValue) {
        this.readable = booleanValue;
    }

    //Method that return the value of isDoingSomething
    isDoingSomething() {
        return this.doSomething;
    }

    //This method Override the super method due to the fact that
    //When it finishes, it checks if the streams is readable and in a positive case it restart the process.
    _doWork(stream) {
        return this.readFromStream(stream)
            .then(result => this.computeResult(result))
            .then(() => {
                if (this.readable) return this.start(stream);
                this.doSomething = false;
            })
    }

}

module.exports = Consumer;