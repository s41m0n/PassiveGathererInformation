"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
// External
const request = require("request");
const uuid = require("node-uuid");
const _ = require("lodash");
const fs = require("fs");
const collection_1 = require("./interfaces/collection");
class Collection {
    constructor(request, CollectionID) {
        this.collectionID = CollectionID;
        this.link = config_1.webUrl + `collection/${this.collectionID}`;
        this.request = request;
    }
    shareWith(toShareWith) {
        return new Promise((resolve, reject) => {
            if (toShareWith.email) {
                this.request({
                    uri: `/casefiles/${this.collectionID}/acl`,
                    json: true,
                }, (error, response, body) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        this.acl = body.acl;
                        this.acl.shared = true;
                        this.request({
                            method: "GET",
                            uri: `/user/${toShareWith.email}`,
                            json: true
                        }, (error, response, body) => {
                            if (error) {
                                reject(error);
                            }
                            else {
                                let user = body.user;
                                if (toShareWith.level) {
                                    user.level = toShareWith.level.toString().toLowerCase();
                                }
                                else {
                                    user.level = "contribute";
                                }
                                this.acl.shareDetails.users.push(user);
                                this.request({
                                    method: "PUT",
                                    uri: `/casefiles/${this.collectionID}/acl`,
                                    json: true,
                                    body: { acl: this.acl }
                                }, (error) => {
                                    if (error) {
                                        reject(error);
                                    }
                                    else {
                                        resolve();
                                    }
                                });
                            }
                        });
                    }
                });
            }
            else {
                reject();
            }
        });
    }
}
exports.Collection = Collection;
class Collections {
    constructor(username, password) {
        this.request = request.defaults({
            baseUrl: config_1.apiUrl,
            auth: {
                user: username,
                pass: password
            }
        });
    }
    create(collectionCreationObject) {
        return new Promise((resolve, reject) => {
            let collection = {};
            if (collectionCreationObject !== null) {
                _.merge(collection, collectionCreationObject);
            }
            if (collection.contents) {
                collection.contents = { wiki: collection.contents, reports: [] };
            }
            _.defaults(collection, {
                title: uuid.v4(),
                contents: { wiki: "", reports: [] }
            });
            this.request({
                method: "POST",
                uri: "/casefiles",
                json: true,
                body: collection
            }, (error, response, body) => {
                if (error || body.response) {
                    reject(error);
                }
                let collectionID = body.caseFileID;
                if (collection.filePath) {
                    let formData = {
                        "stix": fs.createReadStream(collection.filePath)
                    };
                    this.request({
                        method: "POST",
                        uri: "/casefiles/" + collectionID + "/importpreview",
                        formData: formData,
                        json: true
                    }, (error, response, body) => {
                        if (error) {
                            reject(error);
                        }
                        if (body && body.candidates && body.candidates.length > 0) {
                            let postBody = {
                                "reportkeys": body.candidates
                            };
                            this.request({
                                method: "POST",
                                uri: "/casefiles/" + collectionID + "/createreports",
                                json: true,
                                body: postBody
                            }, (error) => {
                                if (error) {
                                    reject(error);
                                }
                                else {
                                    resolve(new Collection(this.request, collectionID));
                                }
                            });
                        }
                        else {
                            resolve(new Collection(this.request, collectionID));
                        }
                    });
                }
                else {
                    resolve(new Collection(this.request, collectionID));
                }
            });
        });
    }
    delete(collectionID) {
        return new Promise((resolve, reject) => {
            this.request({
                method: "DELETE",
                uri: "/casefiles/" + collectionID,
                json: true,
            }, (error, response, body) => {
                (error ? reject(error) : resolve(body));
            });
        });
    }
    get(collectionOptions) {
        return new Promise((resolve, reject) => {
            let uri = "";
            if (collectionOptions && collectionOptions.collectionID) {
                uri = "/casefiles/" + collectionOptions.collectionID;
            }
            else if (collectionOptions && collectionOptions.type) {
                if (collectionOptions.type === collection_1.Shared.Mine) {
                    uri = "/casefiles";
                }
                else {
                    uri = "/casefiles/" + collectionOptions.type.toString().toLowerCase();
                }
            }
            else {
                uri = "/casefiles";
            }
            this.request({
                uri: uri
            }, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(body);
                }
            });
        });
    }
}
exports.Collections = Collections;
