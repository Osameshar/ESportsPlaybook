
var _ = require("underscore");

//cache current playbook
//Should this be in SessionStorage?
var loadedPlaybookDetails;
var currentMap;

var onLoad = function(selectedId,callback) {
    dataAccess.findPlaybookDetailsById(selectedId, function(doc) {
        loadedPlaybookDetails = doc;
        console.log(loadedPlaybookDetails);
        viewEventHandler.emit("view-selected", "main", "playbook-overview", loadedPlaybookDetails);
    })
};

var selectMap = function(selectedMap) {
    currentMap = selectedMap
    let map = _.find(loadedPlaybookDetails.maps, function(x){return x.mapName == selectedMap})
    viewEventHandler.emit("view-selected", "plays", "playbook-overview-plays", map)
}

var deletePlaybook = function(callback) {
    dataAccess.deletePlaybook(loadedPlaybookDetails, function(result) {
        dataAccess.findAllPlaybooksByAccount(function(playbooks) {
            callback(playbooks);
        })
    });
}

var addPlay = function(play, callback) {
    //probably should be in the form.
    play.mapName = currentMap;
    dataAccess.insertPlay(loadedPlaybookDetails, play, function(result) {

    })
}

var viewPlay = function(playId, callback) {
    let map = _.find(loadedPlaybookDetails.maps, function(x){return x.mapName == currentMap})
    let play = _.find(map.plays, function(x) {return x.playId = playId});
    viewEventHandler.emit("view-selected", "main", "play-view", play)
}

exports.onLoad = onLoad;
exports.selectMap = selectMap;
exports.addPlay = addPlay;
exports.deletePlaybook = deletePlaybook;
exports.viewPlay = viewPlay;