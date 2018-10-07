/**
 * @file index.js
 * @module yoroi-passivegathererinformations/index
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

//Requiring Database Models
require('./model/domain');
require('./model/ipv4');
require('./model/domainResolution');
require('./model/ipSslCertificate');
require('./model/whois');
const logger = require('./lib/logger');
const settings = require('./settings.js');
const mongoose = require('mongoose');
const utility = require('./lib/utility');
mongoose.Promise = global.Promise;

let task;

//Connect to the DB
mongoose.connect(`mongodb://${settings.database.mongo.address}/${settings.database.mongo.name}`,
    settings.database.mongo.options, err => {
        if (err) return shutdown(err);
        else process.nextTick(start);
    });

//Function called to shut down the system
function shutdown(message) {
    if (task) task.stopNow();
    mongoose.disconnect();
    if (message) logger.error({err: message}, 'SHUTDOWN WITH ERROR');
    else logger.info('SHUTDOWN OK');
}

function start() {
    //Requiring all Tasks
    const DomainProducer = require('./taskWrite/domainProducer');
    const DomainResolver = require('./taskWrite/domainResolver');
    const CertificateProducer = require('./taskWrite/certificateProducer');
    const ImportSuricata = require('./taskWrite/importSuricata');
    const WhoisProducerXforce = require('./taskWrite/whoisProducerXforce');
    const WhoisProducerCymru = require('./taskWrite/whoisProducerCymru');
    const Finder = require('./lib/task/finder');

    let messageError = '';

    switch (process.argv[2]) {
        //Add a single domain from input into Domain collection
        // INPUT-> domain
        case 'addD': {
            //Check - not empty input
            //      - not an Ip address
            if (process.argv[3] && !utility.isIp(process.argv[3])) {
                task = new DomainProducer({domain: process.argv[3]});
            } else messageError = 'A DOMAIN is required';
            break;
        }
        //Add all domains from a file into Domain collection
        // INPUT->filePath
        case 'importD': {
            if (process.argv[3]) {
                task = new DomainProducer({path: process.argv[3]});
            } else messageError = 'Missing path to file';
            break;
        }
        //Resolve domain. If input -> resolve that domain, else resolve all domains in DB
        //Input-> domain[0,1]
        case 'resolveD' : {
            if (process.argv[3]) {
                if(!utility.isIp(process.argv[3])) settings.tasks.domainResolver.domain = process.argv[3];
                else messageError = "This is an IP address not a Domain"
            }
            task = new DomainResolver(settings.tasks.domainResolver);
            break;
        }
        //Resolve fingerprint. If input -> resolve that target, else resolve all target in DB
        //INPUT-> IP/Domain[0,1]
        case 'resolveFP': {
            if (process.argv[3]) settings.tasks.ipCertificate.target = process.argv[3];
            task = new CertificateProducer(settings.tasks.ipCertificate);
            break;
        }
        //Import log from suricata
        // INPUT-> filePath
        case 'importS': {
            if (process.argv[3]) {
                settings.tasks.importSuricata.path = process.argv[3];
                task = new ImportSuricata(settings.tasks.importSuricata);
            } else messageError = 'Missing log path';
            break;
        }
        //Whois of a target using XFORCE API. If input-> only that target. Else all target in DB.
        //INPUT-> IP/Domain[0,1]
        case 'xforceW' : {
            if (process.argv[3]) settings.tasks.xforceWhois.target = process.argv[3];
            task = new WhoisProducerXforce(settings.tasks.xforceWhois);
            break;
        }
        //Whois of all IPs using CYMRU
        //INPUT-> none
        case 'cymruW': {
            task = new WhoisProducerCymru(settings.tasks.cymruWhois);
            break;
        }
        //Search for fingerprint
        // INPUT->domain/ip + date[0,1] + 'from'[0,1]
        case 'findFP': {
            if (!process.argv[3]) {
                messageError = 'Missing IP/Domain';
                break;
            } else {
                let conf = {
                    target: process.argv[3],
                    collection: 'IpSslCertificate'
                };
                if (process.argv[4]) conf.date = utility.getDateFromString(process.argv[4], "MM/DD/YYYY");
                if(process.argv[5] === 'from') conf.allFromDate = true;
                task = new Finder(conf);
            }
            break;
        }
        //Search for Whois
        // INPUT-> target + date[0,1] + 'from'[0,1]
        case 'findW' : {
            if(!process.argv[3]){
                messageError = 'Missing target';
                break;
            } else {
                let conf = {
                    target: process.argv[3],
                    collection: 'Whois'
                };
                if(process.argv[4]) conf.date = utility.getDateFromString(process.argv[4], "MM/DD/YYYY");
                if(process.argv[5] === 'from') conf.allFromDate = true;
                task = new Finder(conf);
            }
            break;
        }
        //Search for a specific domainResolution
        //INPUT->ip/domain + date[0,1] + from[0,1]
        case 'findDR': {
            if (!process.argv[3]) {
                messageError = 'Missing IP/Domain';
                break;
            } else {
                let conf = {
                    target: process.argv[3],
                    collection: 'DomainResolution'
                };
                if (process.argv[4]) conf.date = utility.getDateFromString(process.argv[4], "MM/DD/YYYY");
                if(process.argv[5] === 'from') conf.allFromDate = true;
                task = new Finder(conf);
            }
            break;
        }
        //Action not recognized
        default : {
            messageError = 'KNOWN_ACTION_REQUIRED';
            break;
        }
    }

    if (task) {
        let start = process.hrtime();
        return task.start().then(() => {
            logger.info('Execution Time: ' + process.hrtime(start) + "s");
            return shutdown();
        });
    } else {
        return shutdown(messageError);
    }
}