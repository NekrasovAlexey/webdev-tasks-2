'use strict';

const mongoNative = require('mongodb');


var server = function (url) {
    if (typeof url != 'string') {
        throw new Error('url должен быть строкой');
    }
    var query = {
        url: url,
        collectionName: null,
        query: {},
        collection: function (collectionName) {
            if (this.collectionName) {
                throw new Error('Вы уже задали коллекцию');
            }
            this.collectionName = collectionName;
            return this;
        },
        where: function (property) {
            if (this.newProperty) {
                throw new Error('Свойство уже задано');
            }
            this.newProperty = property;
            return this;
        },
        not: function () {
            this.isNot = true;
            return this;
        },
        equal: function (value) {
            if (!this.newProperty) {
                throw new Error('Не задано свойство');
            }
            if (this.isNot) {
                this.query = {[this.newProperty]: {$ne: value}};
                this.newProperty = null;
                return this;
            }
            this.query[this.newProperty] = value;
            this.newProperty = null;
            return this;
        },
        lessThan: function (value) {
            addQuery('$lt', value, this);
            return this;
        },
        greatThan: function (value) {
            addQuery('$gt', value, this);
            return this;
        },
        include: function (values) {
            addQuery('$in', values, this);
            return this;
        },
        find: function (cb) {
            connectToBase(function (collection, _this) {
                collection.find(_this.query, function (err, data) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    data.toArray(cb);
                });
            }, this);
        },
        remove: function (cb) {
            connectToBase(function (collection, _this) {
                collection.remove(_this.query, cb);
            }, this);
        },
        set: function (property, value) {
            this.set = {$set: {[property]: value}};
            return this;
        },
        update: function (cb) {
            if (!this.set) {
                cb(new Error('Не было задано обновление'));
                return;
            }
            connectToBase(function (collection, _this) {
                collection.update(_this.query, _this.set, cb);
            }, this);
        },
        insert(item, cb) {
            if (typeof item != 'object') {
                cb(new Error('Вставляемый элемент должен быть объектом'));
                return;
            }
            connectToBase(function (collection) {
                collection.insert(item, cb);
            });
        }

    };
    return query;

    function connectToBase(cb, _this) {
        mongoNative.MongoClient.connect(_this.url, function (err, db) {
            if (err) {
                cb(err);
                return;
            }
            var collection = db.collection(_this.collectionName);
            cb(collection, _this);
        });
    }

    function addQuery(operator, value, _this) {
        if (!_this.newProperty) {
            throw new Error('Не задано свойство');
        }
        if (!_this.query[_this.newProperty]) {
            _this.query[_this.newProperty] = {};
        }
        var query = _this.query[_this.newProperty];
        if (_this.isNot) {
            if (!query['$not']) {
                query['$not'] = {};
            }
            query['$not'][operator] = value;
            _this.newProperty = null;
            _this.isNot = false;
            return _this;
        }
        query[operator] = value;
        _this.newProperty = null;
        _this.isNot = false;
        return _this;
    }
};

module.exports.server = server;
