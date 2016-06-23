 //View switching logic
  var viewEventHandler = require("./lib/viewEventHandler");
  var playbookOverview = require("./lib/playbook-overview");
  var dataAccess = require("./lib/data-access");

  viewEventHandler.on("renderedView", function(elementId, renderedView) {
    $("#" + elementId).html(renderedView);
  });
  
  var showContent = function(view, selectedId, context) {
    //go to the correct view javascript and process the initial data to pass to the template
    //this applied to nav buttons not logic in the actual views.
    var viewData;
    if(view == "playbook-overview")
    {
      playbookOverview.onLoad(selectedId);
    }
    else {
      viewEventHandler.emit("view-selected", "top-bar", "top-bar", viewData);
      viewEventHandler.emit("view-selected", "side-nav", "side-nav", context);    
      viewEventHandler.emit("view-selected", "main", view, viewData);
    }    
  };

  //startup
    $(function() {  
      initIndex(function (initData) {
        showContent("home", "home", initData);
        $(document).on("click",".nav",function(ev) {
          ev.preventDefault();
          if(this.id === "home"){
            showContent(this.id, this.id, initData);
          }
          else{
            showContent("playbook-overview", this.id, initData);
          }        
        });  
      });       
    });

//don't need to insert here
//TODO: Remove because this is just seed data
//Replace with get all playbooks for that account.
 var initIndex = function (callback) {
    dataAccess.insertMany({}, function () {
          dataAccess.findAllPlaybooks(function(docs) {
          callback(docs);
        })
    });

 }