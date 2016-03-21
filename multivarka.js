'use strict';

const mongoMethods = require('./mongoMethods');

class Connection {
    constructor (url) {
        if (typeof url !== 'string') {
            throw new Error('url должен быть строкой');
        }
        let collection = null;
        let newProperty;
        let query = {};
        let isNot;
        let updateSet;
        let mongo;

        let connection = {
            collection: function (name) {
                collection = name;
                return multivarka;
            }
        };

        let multivarka = {
            where: function (property) {
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
                    isNot = false;
                    return this;
                }
                query[newProperty] = value;
                newProperty = null;
                return this;
            },
            lessThan: function (value) {
                this._addQuery('$lt', value);
                return this;
            },
            greatThan: function (value) {
                this._addQuery('$gt', value);
                return this;
            },
            include: function (values) {
                this._addQuery('$in', values);
                return this;
            },
            find: function (cb) {
                this._connectToMongo(() => mongo.find(collection, query, cb));
                this._resetQuery();
                return connection;
            },
            remove: function (cb) {
                this._connectToMongo(() => mongo.remove(collection, query, cb));
                this._resetQuery();
                return connection;
            },
            set: function (property, value) {
                if (!updateSet) {
                    updateSet = {$set: {}};
                }
                updateSet['$set'][property] = value;
                return this;
            },
            update: function (cb) {
                if (!updateSet) {
                    cb(new Error('Не было задано обновление'));
                    return;
                }
                this._connectToMongo(() => mongo.update(collection, query, updateSet, cb));
                this._resetQuery();
                return connection;
            },
            insert: function (item, cb) {
                if (typeof item !== 'object' && item !== null) {
                    cb(new Error('Вставляемый элемент должен быть объектом'));
                    return;
                }
                this._connectToMongo(() => mongo.insert(collection, item, cb));
                this._resetQuery();
                return connection;
            },
            _addQuery(operator, value) {
                if (!newProperty) {
                    throw new Error('Не задано свойство');
                }
                if (!query[newProperty] || isEqualQuery(query[newProperty])) {
                    query[newProperty] = {};
                }
                let propertyQuery = query[newProperty];
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

                function isEqualQuery(query) {
                    if (typeof query !== 'object') {
                        return true;
                    }
                    return ['$lt', '$gt', '$in', '$ne'].every(operator => {
                        return Object.keys(query).indexOf(operator) === -1;
                    });
                }
            },
            _resetQuery() {
                collection = null;
                query = {};
                isNot = false;
                updateSet = null;
            },
            _connectToMongo(cb) {
                mongo = mongo || new mongoMethods.MongoConnection(url);
                cb();
            }
        };

        return connection;
    }
}

module.exports.server = function (url) {
    return new Connection(url);
};

