
var _ = require("underscore");

//cache current playbook
//Should this be in SessionStorage?
let viewModel;

let onLoad = function (selectedId, callback) {
    viewModel = {
        plays: [],
    };
    dataAccess.findPlaybookById(selectedId, (doc) => {
        viewModel.playbook = doc;
        _.each(viewModel.playbook.plays, (x) => {
            dataAccess.findPlayById(x._id, (doc) => {
                viewModel.plays.push(doc);
            });
        });
        viewEventHandler.emit("view-selected", "main", "playbook-overview", viewModel);
    });
};

var selectMap = function (selectedMap) {
    currentMap = selectedMap;
    let map = _.find(viewModel.maps, function (x) { return x.mapName == selectedMap; });
    viewEventHandler.emit("view-selected", "plays", "playbook-overview-plays", map);
};

var deletePlaybook = function (callback) {
    dataAccess.deletePlaybook(viewModel, function (result) {
        dataAccess.findAllPlaybooksByAccount(function (playbooks) {
            callback(playbooks);
        });
    });
};

let addPlay = (play, callback) => {
    dataAccess.insertPlay(play,viewModel.playbook._id, (result) => {
        onLoad(viewModel.playbook._id);
    });
};

var viewPlay = function (playId, callback) {
    let map = _.find(viewModel.maps, function (x) { return x.mapName == currentMap; });
    let play = _.find(map.plays, function (x) { return x.playId == playId; });
    viewEventHandler.emit("view-selected", "top-bar", "top-bar", { pageName: play.mapName + ": " + play.playName });
    viewEventHandler.emit("view-selected", "main", "play-view", play);
};

//may be un needed
var returnToLoadedPlaybook = function (callback) {
    viewEventHandler.emit("view-selected", "main", "playbook-overview", viewModel);
    let map = _.find(viewModel.maps, function (x) { return x.mapName == currentMap; });
    viewEventHandler.emit("view-selected", "plays", "playbook-overview-plays", map);
    if (callback)
        callback();
};

//analytics
var logSuccess = function (playId, callback) {
    let playlistId = _.find(viewModel.maps, function (x) { return x.mapName == currentMap; }).playlistId;
    dataAccess.updateSuccessCount(playlistId, playId, function (result) {
        callback(result);
        refreshCache(viewModel.playbookId);
    });
};

//analytics
var logFailure = function (playId, callback) {
    let playlistId = _.find(viewModel.maps, function (x) { return x.mapName == currentMap; }).playlistId;
    dataAccess.updateFailureCount(playlistId, playId, function (result) {
        callback(result);
        refreshCache(viewModel.playbookId);
    });
};

//helpers
//var refreshCache = function (cachedId) {
//    sessionStorage.removeItem(cachedId);
//    dataAccess.findPlaybookDetailsById(cachedId, function (doc) {
//        loadedPlaybookDetails = doc;
//    });
//};

exports.onLoad = onLoad;
exports.selectMap = selectMap;
exports.addPlay = addPlay;
exports.deletePlaybook = deletePlaybook;
exports.viewPlay = viewPlay;
exports.returnToLoadedPlaybook = returnToLoadedPlaybook;
exports.logSuccess = logSuccess;
exports.logFailure = logFailure;