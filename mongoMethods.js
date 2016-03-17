'use strict';

const MongoClient = require('mongodb').MongoClient;

class MongoConnection {
    constructor (url, mongo) {
        mongo.connect = MongoClient.connect(url);
        this.find = function (collectionName, query, cb) {
            mongo.connect
                .then(db => {
                    db.collection(collectionName).find(query).toArray()
                        .then(data => {
                            cb(null, data);
                        })
                        .catch(err => {
                            cb(err);
                            db.close();
                            mongo.connect = null;
                        });
                })
                .catch(cb);
        };
        this.remove = (collectionName, query, cb) => {
            mongo.connect
                .then(db =>
                    db.collection(collectionName).remove(query)
                        .then(data =>
                            cb(null, data)
                        )
                        .catch(err => {
                            cb(err);
                            db.close();
                            mongo.connect = null;
                        })
                )
                .catch(cb);
        };
        this.update = (collectionName, query, updateSet, cb) => {
            mongo.connect
                .then(db =>
                    db.collection(collectionName).update(query, updateSet)
                        .then(data =>
                            cb(null, data)
                        )
                        .catch(err => {
                            cb(err);
                            db.close();
                            mongo.connect = null;
                        })
                )
                .catch(cb);
        };
        this.insert = (collectionName, item, cb) => {
            mongo.connect
                .then(db =>
                    db.collection(collectionName).insert(item)
                        .then(data =>
                            cb(null, data)
                        )
                        .catch(err => {
                            cb(err);
                            db.close();
                            mongo.connect = null;
                        })
                )
                .catch(cb);
        };
    }
}

exports.MongoConnection = MongoConnection;
