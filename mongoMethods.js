'use strict';

const mongoNative = require('mongodb');

function connectToBase(url) {
    return new Promise((resolve, reject) => {
        mongoNative.MongoClient.connect(url)
            .then(db => {
                resolve(db);
            })
            .catch(err => {
                reject(err);
            });
    });
}

exports.find = function (url, collectionName, query, cb) {
    connectToBase(url)
        .then((db, connection) => {
            db.collection(collectionName).find(query).toArray()
                .then(data => {
                    cb(null, data);
                })
                .catch(err => {
                    cb(err);
                    connection.close();
                });
        })
        .catch(err => {
            cb(err);
        });
};

exports.remove = (url, collectionName, query, cb) => {
    connectToBase(url)
        .then((db) => {
            db.collection(collectionName).remove(query)
                .then(data => {
                    cb(null, data);
                })
                .catch(err => {
                    cb(err);
                    db.close();
                });
        })
        .catch(err => {
            cb(err);
        });
};

exports.update = (url, collectionName, query, updateSet, cb) => {
    connectToBase(url)
        .then((db) => {
            db.collection(collectionName).update(query, updateSet)
                .then(data => {
                    cb(null, data);
                })
                .catch(err => {
                    cb(err);
                    db.close();
                });
        })
        .catch(err => {
            cb(err);
        });
};

exports.insert = (url, collectionName, item, cb) => {
    connectToBase(url)
        .then((db) => {
            db.collection(collectionName).insert(item)
                .then(data => {
                    cb(null, data);
                })
                .catch(err => {
                    cb(err);
                    db.close();
                });
        })
        .catch(err => {
            cb(err);
        });
};
