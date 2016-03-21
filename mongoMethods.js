'use strict';

const MongoClient = require('mongodb').MongoClient;

class MongoConnection {
    constructor (url) {
        this.url = url;
    }

    _connect () {
        this.connection = this.connection || MongoClient.connect(this.url);
        return this.connection;
    }

    find (collectionName, query, cb) {
        this._connect()
            .then(db => {
                db.collection(collectionName).find(query).toArray()
                    .then(data => {
                        cb(null, data);
                    })
                    .catch(err => {
                        cb(err);
                        db.close();
                        this.connection = null;
                    });
            })
            .catch(cb);
    };

    remove (collectionName, query, cb) {
        this._connect()
            .then(db =>
                db.collection(collectionName).deleteMany(query)
                    .then(data =>
                        cb(null, data)
                    )
                    .catch(err => {
                        cb(err);
                        db.close();
                        this.connection = null;
                    })
            )
            .catch(cb);
    };
    update (collectionName, query, updateSet, cb) {
        this._connect()
            .then(db =>
                db.collection(collectionName).updateMany(query, updateSet)
                    .then(data =>
                        cb(null, data)
                    )
                    .catch(err => {
                        cb(err);
                        db.close();
                        this.connection = null;
                    })
            )
            .catch(cb);
    };
    insert (collectionName, item, cb) {
        this._connect()
            .then(db =>
                db.collection(collectionName).insertOne(item)
                    .then(data =>
                        cb(null, data)
                    )
                    .catch(err => {
                        cb(err);
                        db.close();
                        this.connection = null;
                    })
            )
            .catch(cb);
    };
}

exports.MongoConnection = MongoConnection;
