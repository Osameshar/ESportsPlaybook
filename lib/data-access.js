var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var _ = require("underscore");
var async = require("async");

var url = 'mongodb://playbookadmin:playbook123@ds019950.mlab.com:19950/esports-playbook';

//TODO: Refactor to not repeat the mongo client code in every method.
//TODO: define variables for each collection to cutdown on reuse
//TODO: handle errors from mongo
var insertOnePlaybook = function (data, callback) {

    MongoClient.connect(url, function(err,db) {

        var playbookCollection = db.collection("playbook");
        var playbookDetailsCollection = db.collection("playbook-details");
        var accountName = sessionStorage.getItem("accountName");

        data.accountName = accountName;

        //build details doc based on newly added playbook
        let playbookDetails = {};
        //TODO: pull standard maps for cs/overwatch
        playbookDetails.maps = [{mapName: "Inferno",playlistId: new ObjectID(),plays: []},
                                {mapName: "Dust2", playlistId:new ObjectID(),plays: []},
                                {mapName: "Mirage",playlistId: new ObjectID(),plays: []},
                                {mapName: "Train", playlistId:new ObjectID(),plays: []}];

        playbookDetailsCollection.insertOne(playbookDetails, function(err, result) {
            data.playbookDetails = result.insertedId;
            playbookCollection.insertOne(data, function(err, result) {
                sessionStorage.setItem(result.insertedId,JSON.stringify(playbookDetails));
                callback(result);
                db.close();
            });
        });
    });
};

var findPlaybookDetailsById = function (playbookId, callback) {  

    checkSessionStorage(playbookId, callback, function(playbookId,callback) {
        MongoClient.connect(url, function(err,db) {
            findDetailsIdFromPlaybookId(playbookId, function(playbookDetailsID) {
                var playbookDetailsCollection = db.collection("playbook-details");
                
                let id = new ObjectID(playbookDetailsID);

                playbookDetailsCollection.findOne({_id: id}, function(err, doc) {                   
                    aggregatePlaybookData(doc, function(docToReturn) {
                        docToReturn.playbookId = playbookId;
                        sessionStorage.setItem(playbookId,JSON.stringify(docToReturn));
                        callback(docToReturn);
                        db.close();
                    });
                });
            });           
        });
    });
};

var deletePlaybook = function (playbook, callback) {
    MongoClient.connect(url, function(err,db) {

        let detailsId = new ObjectID(playbook._id);        
        let collectionPlaybookDetails = db.collection("playbook-details");

        collectionPlaybookDetails.deleteOne({_id: detailsId},function(err, result) {

            let collectionPlaybook = db.collection("playbook");
            collectionPlaybook.deleteOne({playbookDetails: detailsId},function(err, result) {
                findPlaybookIdFromDetailsId(detailsId, function(playbookId) {
                    sessionStorage.removeItem(playbookId);
                    callback(result);
                    db.close();
                });               
            });
        });
    });
};

var insertPlay = function (playbookDetails, play, callback) {
    MongoClient.connect(url, function(err,db) {

        var playlistCollection = db.collection("playlists");

        let playId = new ObjectID();
        let playlistId = _.find(playbookDetails.maps, function(x){return x.mapName == play.mapName;}).playlistId;
        play.playId = playId;

        playlistCollection.update(
            {_id: new ObjectID(playlistId)},
            {
                $push: {plays:play}
            },
            {upsert: true}, function(err, result) {
                findPlaybookIdFromDetailsId(playbookDetails._id,function(playbookId) {
                    var cacheItem = JSON.parse(sessionStorage.getItem(playbookId));
                    _.find(cacheItem.maps, function(x){return x.playlistId == playlistId;}).plays.push(play);
                    sessionStorage.setItem(playbookId,JSON.stringify(cacheItem));
                    callback(cacheItem);
                    db.close();
                });
            });
        
    });
};

var updateSuccessCount = function(playlistId, playId, callback) {
    MongoClient.connect(url, function(err,db) {
        let playlistCollection = db.collection("playlists");
        playlistCollection.findOne({_id: new ObjectID(playlistId)},function(err, result) {
            var play = _.find(result.plays, function(x){return x.playId == playId;});
            play.successCount += 1;
            play.efficacy = ((play.successCount / (play.successCount + play.failureCount))*100).toFixed(2);
            playlistCollection.updateOne({_id: new ObjectID(playlistId)},
            {$set: {plays: result.plays}}, function(err, res) {
                callback(play.efficacy);
            });

        });
    });
};

var updateFailureCount = function(playlistId, playId, callback) {
    MongoClient.connect(url, function(err,db) {
        let playlistCollection = db.collection("playlists");
        playlistCollection.findOne({_id: new ObjectID(playlistId)},function(err, result) {
            var play = _.find(result.plays, function(x){return x.playId == playId;});
            play.failureCount += 1;
            play.efficacy = ((play.successCount / (play.successCount + play.failureCount))*100).toFixed(2);
            playlistCollection.updateOne({_id: new ObjectID(playlistId)},
            {$set: {plays: result.plays}}, function(err, res) {
                callback(play.efficacy);
            });
        });
    });
};

//helpers
var findDetailsIdFromPlaybookId = function (playbookId,callback) {
    let loadedPlaybooks =  JSON.parse(sessionStorage.getItem("loadedPlaybooks"));
    let playbookDetailsID = _.find(loadedPlaybooks, function(x) {
        return x._id == playbookId;
    }).playbookDetails;

    callback(playbookDetailsID);
};

var findPlaybookIdFromDetailsId = function (detailsId,callback) {
    let loadedPlaybooks =  JSON.parse(sessionStorage.getItem("loadedPlaybooks"));
    let playbookId = _.find(loadedPlaybooks, function(x) {
        return x.playbookDetails == detailsId;
    })._id;

    callback(playbookId);
};

var aggregatePlaybookData = function(docToReturn, callback) {
    MongoClient.connect(url, function(err,db) {
        var playlistCollection = db.collection("playlists");

        async.each(docToReturn.maps,function(map,cb) {
            playlistCollection.findOne({_id: map.playlistId},function(err, doc) {
                if(doc)
                    map.plays = doc.plays;
                cb();
            });
        }, function(err) {
            callback(docToReturn);
        });
    });
};

var checkSessionStorage = function (playbookId, callback, goToDbCallback) {
    var doc = JSON.parse(sessionStorage.getItem(playbookId));
    if(doc !== undefined && doc !== null) {
       callback(doc);
    } 
    else {
        goToDbCallback(playbookId,callback);
    }    
};

var submitAccount = function(accountName, callback) {
    sessionStorage.setItem("accountName",accountName);
    findAllPlaybooksByAccount(callback)  ;  
};

var findAllPlaybooksByAccount = function(callback) {
    let accountName = sessionStorage.getItem("accountName");
    MongoClient.connect(url, function(err,db) {

            var collection = db.collection("playbook");            
            collection.find({"accountName": accountName}).toArray(function(err, docs) {
                sessionStorage.setItem("loadedPlaybooks", JSON.stringify(docs));
                callback(docs);
                db.close();
            });
        });
};

module.exports.insertOnePlaybook = insertOnePlaybook;
module.exports.findPlaybookDetailsById = findPlaybookDetailsById;
module.exports.findAllPlaybooksByAccount = findAllPlaybooksByAccount;
module.exports.insertPlay = insertPlay;
module.exports.deletePlaybook = deletePlaybook;
module.exports.submitAccount = submitAccount;
module.exports.updateSuccessCount = updateSuccessCount;
module.exports.updateFailureCount = updateFailureCount;

