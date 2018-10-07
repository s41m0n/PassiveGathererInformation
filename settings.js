/**
 * @file settings.js
 * @module yoroi-passivegathererinformations/settings
 * @author Simone Magnani
 * @version 0.0
 *
 */
'use strict';

//By exporting this model we can directly refer to this useful information
module.exports = {
    //Reference Database
    database: {
        mongo: {
            address: '127.0.0.1',
            name: 'passiveInformationGathererDB',
            options: {
                useMongoClient: true,
                autoIndex: true,
                keepAlive: 50000,
                connectTimeoutMS: 0
            },
            username: '',
            password: ''
        }
    },
    //All tasks' config
    tasks: {
        //config for DomainResolver Task
        domainResolver: {
            //Parallel operations
            parallel: 11,
            //List of rrtypes we're interested
            rrtype: ['A', 'AAAA', 'MX', 'TXT', 'NS']
        },
        //config for CertificateProducer Task
        ipCertificate: {
            //Parallel operations
            parallel: 75
        },
        //config for ImportSuricata Task
        importSuricata: {
            //Parallel operations
            parallel: 1000,
            //List of all rrtypes we're interested
            rrtype: ['A', 'AAAA', 'MX', 'TXT', 'NS'],
        },
        //config for whois task (XForce)
        xforceWhois: {
            parallel: 1000,
            key: 'ba4e57e7-e613-4cff-8af5-76c9ec0fbe4a',
            pass: '2a6116c0-93b2-48be-a1e9-e9be30bd4f0f',
        },
        //config for whois task (cymru)
        cymruWhois: {
            parallel: 1000
        }
    }
};