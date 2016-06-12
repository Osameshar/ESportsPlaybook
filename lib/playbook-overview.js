
var _ = require("underscore");

//cache current playbook
var loadedPlaybook;

var onLoad = function(selectedId,callback) {
    dataAccess.findPlaybookByName(selectedId, function(doc) {
        loadedPlaybook = doc;
        viewEventHandler.emit("view-selected", "main", "playbook-overview", loadedPlaybook);
    })
};

var selectMap = function(selectedMap) {

    let plays = _.find(loadedPlaybook.maps, function(x){return x.mapName == selectedMap})
    viewEventHandler.emit("view-selected", "plays", "playbook-overview-plays", plays)
}


exports.onLoad = onLoad;
exports.selectMap = selectMap;