'use strict';

const mongoNative = require('mongodb');


var server = function (url) {
    if (typeof url != 'string') {
        throw new Error('url должен быть строкой');
    }
    var url = url;
    var collectionName = null;
    var newProperty;
    var query = {};
    var isNot;
    var updateSet;
    var multivarka = {
        collection: function (name) {
            if (collectionName) {
                throw new Error('Вы уже задали коллекцию');
            }
            collectionName = name;
            return this;
        },
        where: function (property) {
            if (newProperty) {
                throw new Error('Свойство уже задано');
            }
            newProperty = property;
            return this;
        },
        not: function () {
            isNot = true;
            return this;
        },
        equal: function (value) {
            if (!newProperty) {
                throw new Error('Не задано свойство');
            }
            if (isNot) {
                query = {[newProperty]: {$ne: value}};
                newProperty = null;
                return this;
            }
            query[newProperty] = value;
            newProperty = null;
            return this;
        },
        lessThan: function (value) {
            addQuery('$lt', value);
            return this;
        },
        greatThan: function (value) {
            addQuery('$gt', value);
            return this;
        },
        include: function (values) {
            addQuery('$in', values);
            return this;
        },
        find: function (cb) {
            connectToBase(function (collection) {
                collection.find(query, function (err, data) {
                    clearFields();
                    if (err) {
                        cb(err);
                        return;
                    }
                    data.toArray(cb);
                });
            });
        },
        remove: function (cb) {
            connectToBase(function (collection) {
                collection.remove(query, function (err, data) {
                    clearFields();
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb(null, data);
                });
            });
        },
        set: function (property, value) {
            updateSet = {$set: {[property]: value}};
            return this;
        },
        update: function (cb) {
            if (!updateSet) {
                cb(new Error('Не было задано обновление'));
                return;
            }
            connectToBase(function (collection) {
                collection.update(query, updateSet, function (err, data) {
                    clearFields();
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb(null, data);
                });
            });
        },
        insert(item, cb) {
            if (typeof item != 'object') {
                cb(new Error('Вставляемый элемент должен быть объектом'));
                return;
            }
            connectToBase(function (collection) {
                collection.insert(item, function (err, data) {
                    clearFields();
                    if (err) {
                        cb(err);
                        return;
                    }
                    cb(null, data);
                });
            });
        }
    };

    return multivarka;

    function clearFields() {
        url = null;
        collectionName = null;
        query = null;
        isNot = false;
        updateSet = null;
    }

    function connectToBase(cb) {
        mongoNative.MongoClient.connect(url, function (err, db) {
            if (err) {
                cb(err);
                return;
            }
            var collection = db.collection(collectionName);
            cb(collection);
        });
    }

    function addQuery(operator, value) {
        if (!newProperty) {
            throw new Error('Не задано свойство');
        }
        if (!query[newProperty]) {
            query[newProperty] = {};
        }
        var propertyQuery = query[newProperty];
        if (isNot) {
            if (!propertyQuery['$not']) {
                propertyQuery['$not'] = {};
            }
            propertyQuery['$not'][operator] = value;
        } else {
            propertyQuery[operator] = value;
        }
        newProperty = null;
        isNot = false;
    }
};

module.exports.server = server;
