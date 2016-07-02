
var _ = require("underscore");

//cache current playbook
//Should this be in SessionStorage?
var loadedPlaybook;
var currentMap;

var onLoad = function(selectedId,callback) {
    dataAccess.findPlaybookDetailsById(selectedId, function(doc) {
        loadedPlaybook = doc;
        viewEventHandler.emit("view-selected", "main", "playbook-overview", loadedPlaybook);
    })
};

var selectMap = function(selectedMap) {
    currentMap = selectedMap
    let map = _.find(loadedPlaybook.maps, function(x){return x.mapName == selectedMap})
    viewEventHandler.emit("view-selected", "plays", "playbook-overview-plays", map)
}

var deletePlaybook = function(callback) {
    dataAccess.deletePlaybook(loadedPlaybook, function(result) {
        dataAccess.findAllPlaybooksByAccount(function(playbooks) {
            callback(playbooks);
        })
    });
}

var addPlay = function(play,callback) {
    //probably should be in the form.
    play.mapName = currentMap;
    dataAccess.insertPlay(loadedPlaybook, play, function(result) {

    })
}

exports.onLoad = onLoad;
exports.selectMap = selectMap;
exports.addPlay = addPlay;
exports.deletePlaybook = deletePlaybook;