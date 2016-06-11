var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://playbookadmin:playbook123@ds019950.mlab.com:19950/esports-playbook';

var insertMany = function (collectionName, data) {

    MongoClient.connect(url, function(err,db) {
        console.log("Connected succesfully to the server");

        var collection = db.collection(collectionName);

        collection.insertMany(data, function(err, result) {
            console.log("Inserted documents into collection: " + collectionName);
        })

        db.close();
    })    
}

module.exports.insertMany = insertMany;