var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var _ = require("underscore");

var url = 'mongodb://playbookadmin:playbook123@ds019950.mlab.com:19950/esports-playbook';

//TODO: Refactor to not repeat the mongo client code in every method.
//TODO: handle errors from mongo
//TODO: Invert details having playbook id to playbook having details id.
var insertOnePlaybook = function (data, callback) {

    MongoClient.connect(url, function(err,db) {

        var playbookCollection = db.collection("playbook");
        var playbookDetailsCollection = db.collection("playbook-details");

        var accountName = sessionStorage.getItem("accountName");
        data.accountName = accountName;
        playbookCollection.insertOne(data, function(err, result) {
            
            //build details doc based on newly added playbook
            let playbookDetails = {};
            playbookDetails.playbookId = result.insertedId;
            //TODO: pull standard maps for cs/overwatch
            playbookDetails.maps = [{mapName: "Inferno",plays:[]},{mapName: "Dust2",plays:[]},
                                    {mapName: "Mirage",plays:[]},{mapName: "Train",plays:[]}];

            playbookDetailsCollection.insertOne(playbookDetails, function(err, result) {    
                sessionStorage.setItem(playbookDetails.playbookId,JSON.stringify(playbookDetails))
                callback(result);
                db.close();
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

var deletePlaybook = function (playbook, callback) {
    MongoClient.connect(url, function(err,db) {
        let detailsId = new ObjectID(playbook._id);
        let playbookId = new ObjectID(playbook.playbookId);

        sessionStorage.removeItem(playbook.playbookId);

        let collectionPlaybookDetails = db.collection("playbook-details");
        collectionPlaybookDetails.deleteOne({_id: detailsId},function(err, result) {

            let collectionPlaybook = db.collection("playbook");
            collectionPlaybook.deleteOne({_id: playbookId},function(err, result) {
                callback(result);
                db.close();
            })

        })
    })
}

var insertPlay = function (playbookDetails, play, callback) {
    MongoClient.connect(url, function(err,db) {
        let detailsId = new ObjectID(playbookDetails._id);
        let map = _.find(playbookDetails.maps, function(x){return x.mapName == play.mapName})
        map.plays.push(play);
        playbookDetails.playbookId = new ObjectID(playbookDetails.playbookId);
        var playbookDetailsCollection = db.collection("playbook-details");

        playbookDetailsCollection.replaceOne(
            {_id: detailsId},
            {
                playbookDetails
            }, function(err, result) {
                callback(result)
                db.close();
            })
    })
}
//helpers
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
    sessionStorage.setItem("accountName",accountName);
    findAllPlaybooksByAccount(callback)    
}

var findAllPlaybooksByAccount = function(callback) {
    let accountName = sessionStorage.getItem("accountName");

    MongoClient.connect(url, function(err,db) {
            var collection = db.collection("playbook");            
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
module.exports.findAllPlaybooksByAccount = findAllPlaybooksByAccount;
module.exports.insertPlay = insertPlay;
module.exports.deletePlaybook = deletePlaybook;
module.exports.submitAccount = submitAccount;