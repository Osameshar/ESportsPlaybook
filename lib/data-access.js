var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://playbookadmin:playbook123@ds019950.mlab.com:19950/esports-playbook';

//TODO: Refactor to not repeat the mongo client code in every method.
var insertOnePlaybook = function (data, callback) {

    MongoClient.connect(url, function(err,db) {

        var playbookCollection = db.collection("playbook");
        var playbookDetailsCollection = db.collection("playbook-details");

        var accountName = sessionStorage.getItem("accountName");
        data.accountName = accountName;
        playbookCollection.insertOne(data, function(err, result) {
            
            //build details based on newly added playbook
            let playbookDetails = {};
            playbookDetails.playbookId = result.insertedId;
            //TODO: pull standard maps for cs/overwatch
            playbookDetails.maps = [{mapName: "Inferno"},{mapName: "Dust2"},
                                    {mapName: "Mirage"},{mapName: "Train"}];

            playbookDetailsCollection.insertOne(playbookDetails, function(err, result) {    
                playbookCollection.find({"accountName": accountName}).toArray(function(err, docs) {
                    sessionStorage.setItem("loadedPlaybooks", JSON.stringify(docs));
                    callback(docs);
                    db.close();
                });
            })
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

var findPlaybookDetailsById = function (playbookId, callback) {
    checkSessionStorage(playbookId,callback,function(playbookId,callback) {
        MongoClient.connect(url, function(err,db) {

            var collection = db.collection("playbook-details");
            let id = new ObjectID(playbookId);
            collection.findOne({playbookId: id}, function(err, doc) {
                sessionStorage.setItem(playbookId,JSON.stringify(doc))
                callback(doc);
                db.close();
            });
        })
    })
}

var checkSessionStorage = function (playbookId,callback,goToDbCallback) {
    var doc = JSON.parse(sessionStorage.getItem(playbookId))
    if(doc != undefined) {
       callback(doc);
    } 
    else {
        goToDbCallback(playbookId,callback)
    }    
}

var submitAccount = function(accountName,callback) {
    MongoClient.connect(url, function(err,db) {
            var collection = db.collection("playbook");
            sessionStorage.setItem("accountName",accountName);
            collection.find({"accountName": accountName}).toArray(function(err, docs) {
                sessionStorage.setItem("loadedPlaybooks", JSON.stringify(docs));
                callback(docs);
                db.close();
            });
        }) 
}

module.exports.insertOnePlaybook = insertOnePlaybook;
module.exports.findAllPlaybooks = findAllPlaybooks;
module.exports.findPlaybookDetailsById = findPlaybookDetailsById;
module.exports.submitAccount = submitAccount;