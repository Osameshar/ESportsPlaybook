 //View switching logic
var viewEventHandler = require("./lib/viewEventHandler");
var playbookOverview = require("./lib/playbook-overview");
var dataAccess = require("./lib/data-access");

viewEventHandler.on("renderedView", function(elementId, renderedView) {
  $("#" + elementId).html(renderedView);
});

var showContent = function(view, context) {
    viewEventHandler.emit("view-selected", "top-bar", "top-bar", context);
    viewEventHandler.emit("view-selected", "side-nav", "side-nav", context);    
    viewEventHandler.emit("view-selected", "main", view, context);
};
    
$(document).on("click",".nav-home",function(ev) {
  ev.preventDefault();
  viewEventHandler.emit("view-selected", "main", "home");
  viewEventHandler.emit("view-selected", "top-bar", "top-bar",  {pageName: this.getAttribute('value') } );
  
});      
$(document).on("click",".nav-add",function(ev) {
  ev.preventDefault();
  viewEventHandler.emit("view-selected", "main", "add-playbook");  
  viewEventHandler.emit("view-selected", "top-bar", "top-bar",  {pageName: this.getAttribute('value') } );
  
});  
$(document).on("click",".nav",function(ev) {
  ev.preventDefault();
  viewEventHandler.emit("view-selected", "top-bar", "top-bar",  {pageName: this.getAttribute('value') } );
  playbookOverview.onLoad(this.id);   
});

//startup
$(function() {  
    viewEventHandler.emit("view-selected", "main", "welcome");
  });  