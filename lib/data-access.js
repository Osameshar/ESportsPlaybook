var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://playbookadmin:playbook123@ds019950.mlab.com:19950/esports-playbook';

//TODO: Refactor to not repeat the mongo client code in every method.
var insertMany = function (data, callback) {

    MongoClient.connect(url, function(err,db) {

        var collection = db.collection("playbook");

        collection.insertMany(data, function(err, result) {
            callback();
            db.close();
        });
    })    
}

var findAllPlaybooks = function (callback) {
    MongoClient.connect(url, function(err,db) {

        var collection = db.collection("playbook");

        collection.find({}).toArray(function(err, docs) {
            callback(docs);
            db.close();
        });
    })  
}

var findPlaybookByName = function (playbookName, callback) {
    checkSessionStorage(playbookName,callback,function(playbookName,callback) {
            MongoClient.connect(url, function(err,db) {

            var collection = db.collection("playbook-details");

            collection.find({"playbookName": playbookName}).limit(1).next(function(err, doc) {
                sessionStorage.setItem(playbookName,JSON.stringify(doc))
                callback(doc);
                db.close();
            });
        }) 
    }) 
}

var checkSessionStorage = function (playbookName,callback,goToDbCallback) {
    var doc = JSON.parse(sessionStorage.getItem(playbookName))
    if(doc != undefined) {
       callback(doc);
    } 
    else {
        goToDbCallback(playbookName,callback)
    }    
}

var submitAccount = function(accountName,callback) {
    MongoClient.connect(url, function(err,db) {
            var collection = db.collection("playbook");
            sessionStorage.setItem("accountName",accountName);
            collection.find({"accountName": accountName}).toArray(function(err, docs) {
                callback(docs);
                db.close();
            });
        }) 
}

module.exports.insertMany = insertMany;
module.exports.findAllPlaybooks = findAllPlaybooks;
module.exports.findPlaybookByName = findPlaybookByName;
module.exports.submitAccount = submitAccount;