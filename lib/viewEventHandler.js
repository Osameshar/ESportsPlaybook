var Emitter = require("events").EventEmitter;
var util = require("util");
var path = require("path");
var fs = require("fs");
var View = require("./view");

var viewEventHandler = function() {
    this.on("view-selected", function(elementId, viewName, context) {
        var view = new View(viewName);
        this.emit("renderedView", elementId, view.ToHtml(context));
    });
};

util.inherits(viewEventHandler, Emitter);
module.exports = new viewEventHandler();