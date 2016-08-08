let MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
let _ = require("underscore");
var async = require("async");

let url = 'mongodb://playbookadmin:playbook123@ds019950.mlab.com:19950/esports-playbook';

let insertOnePlaybook = (data, callback) => {
    MongoClient.connect(url, (err, db) => {
        let playbookCollection = db.collection("playbook");

        playbookCollection.insertOne(data, (err, result) => {
            callback(result);
            db.close();
        });
    });
};

let insertPlay = (play, playbookId, callback) => {
    let analyticsId;
    let roleIds = [];

    MongoClient.connect(url, (err, db) => {
        let analyticsCollection = db.collection("analytics");
        analyticsCollection.insertOne(play.analytics, (err, result) => {
            analyticsId = result.insertedId;
            //use async here
            async.each(play.roles, (x, callback) => {
                let rolesCollection = db.collection("roles");
                rolesCollection.insertOne(x, (err, result) => {
                    roleIds.push(result.insertedId);
                    callback();
                });
            }, (err) => {
                let newPlay = {
                    playName: play.playName,
                    mapName: play.mapName,
                    analyticsId: analyticsId,
                    roles: roleIds
                };
                let playCollection = db.collection("play");
                playCollection.insertOne(newPlay, (err, result) => {
                    findPlaybookById(playbookId, (doc) => {
                        doc.plays.push(result.insertedId);
                        updatePlaybookById(doc);
                    });
                });
            });
            console.log("asdas");
        });
    });
};

let updatePlaybookById = (data, callback) => {
    MongoClient.connect(url, (err, db) => {
        let playbookId = data._id;
        let playbookCollection = db.collection("playbook");
        playbookCollection.replaceOne({ _id: new ObjectID(playbookId) }, data, (err, result) => {

        });
    });
};

let findPlaybookById = (playbookId, callback) => {
    MongoClient.connect(url, (err, db) => {
        let playbookCollection = db.collection("playbook");
        let id = new ObjectID(playbookId);

        playbookCollection.findOne({ _id: id }, function (err, doc) {
            callback(doc);
            db.close();
        });
    });
};

let findPlayById = (playId, callback) => {
    MongoClient.connect(url, (err, db) => {
        let playCollection = db.collection("play");
        let id = new ObjectID(playId);

        playCollection.findOne({ _id: id }, function (err, doc) {
            callback(doc);
            db.close();
        });
    });
};

let findAllPlaybooksByAccount = function (callback) {
    let accountName = sessionStorage.getItem("accountName");
    MongoClient.connect(url, function (err, db) {
        let playbookCollection = db.collection("playbook");
        playbookCollection.find({ "accountName": accountName }).toArray(function (err, docs) {
            callback(docs);
            db.close();
        });
    });
};

let submitAccount = (accountName, callback) => {
    sessionStorage.setItem("accountName", accountName);
    findAllPlaybooksByAccount(callback);
};

module.exports.insertOnePlaybook = insertOnePlaybook;
module.exports.submitAccount = submitAccount;
module.exports.findAllPlaybooksByAccount = findAllPlaybooksByAccount;
module.exports.findPlaybookById = findPlaybookById;
module.exports.findPlayById = findPlayById;
module.exports.insertPlay = insertPlay;
module.exports.updatePlaybookById = updatePlaybookById;