/**
 * @file task.js
 * @module lib/task
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

//Basic Task
class Task {

    constructor(settings) {
        //Variable to store all settings concerning the task (ex. parallelism, rrtype record, ecc.)
        this.settings = settings;
        //Variable set as true when the task is stopped
        this.stopped = false;
    }

    //Method each class which extends this must implement
    _doWork() {

    }

    //Method called when the task is stopped
    _endWork() {

    }

    start() {
        return Promise.resolve(this._doWork());
    }

    stopNow() {
        this.stopped = true;
        return Promise.resolve(this._endWork());
    }

}

module.exports = Task;
