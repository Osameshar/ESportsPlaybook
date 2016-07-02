
var _ = require("underscore");

//cache current playbook
//Should this be in SessionStorage?
var loadedPlaybook;

var onLoad = function(selectedId,callback) {
    dataAccess.findPlaybookDetailsById(selectedId, function(doc) {
        loadedPlaybook = doc;
        viewEventHandler.emit("view-selected", "main", "playbook-overview", loadedPlaybook);
    })
};

var selectMap = function(selectedMap) {

    let plays = _.find(loadedPlaybook.maps, function(x){return x.mapName == selectedMap})
    viewEventHandler.emit("view-selected", "plays", "playbook-overview-plays", plays)
}

var deletePlaybook = function(callback) {
    dataAccess.deletePlaybook(loadedPlaybook, function(result) {
        dataAccess.findAllPlaybooksByAccount(function(playbooks) {
            callback(playbooks);
        })
    });
}

exports.onLoad = onLoad;
exports.selectMap = selectMap;
exports.deletePlaybook = deletePlaybook;