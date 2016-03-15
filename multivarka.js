'use strict';

const mongoMethods = require('./mongoMethods');

let Connection = function (url) {
    if (typeof url !== 'string') {
        throw new Error('url должен быть строкой');
    }
    let collection = null;
    let newProperty;
    let query = {};
    let isNot;
    let updateSet;

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
        find: cb => {
            mongoMethods.find(url, collection, query, cb);
            resetQuery();
            return connection;
        },
        remove: cb => {
            mongoMethods.remove(url, collection, query, cb);
            resetQuery();
            return connection;
        },
        set: function (property, value) {
            if (!updateSet) {
                updateSet = {$set: {}};
            }
            updateSet['$set'][property] = value;
            return this;
        },
        update: cb => {
            if (!updateSet) {
                cb(new Error('Не было задано обновление'));
                return;
            }
            mongoMethods.update(url, collection, query, updateSet, cb);
            resetQuery();
            return connection;
        },
        insert(item, cb) {
            if (typeof item !== 'object' && item !== null) {
                cb(new Error('Вставляемый элемент должен быть объектом'));
                return;
            }
            mongoMethods.insert(url, collection, item, cb);
            resetQuery();
            return connection;
        }
    };

    return connection;

    function addQuery(operator, value) {
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
    }

    function resetQuery() {
        collection = null;
        query = {};
        isNot = false;
        updateSet = null;
    }
};

module.exports.server = function (url) {
    return new Connection(url);
};
