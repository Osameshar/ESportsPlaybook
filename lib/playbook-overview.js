
    let playbookData; 
    
    var onLoad = function(selectedId) {
        //get initial data somehow
        let initialData = {
            playbookName: selectedId,
            maps: [
                {
                    mapName: "Inferno"
                },
                {
                    mapName: "Dust2"
                },
                {
                    mapName: "Train"
                },
                {
                    mapName: "Mirage"
                }
            ]
        };
        
        pageData = initialData;
        return initialData;
    };
    
    var selectMap = function(selectedMap) {
        //get map specific plays somehow... from db or something
        //getPlays(pageData.playbookName,selectedMap)
        //OR load all the data about the playbook on load and store the playbookData in var
        let plays ={
            plays: [
            {
                playName: "play1"
            },
            {
                playName: "play2"
            },
            {
                playName: "play3"
            }
        ]
        } 
        console.log(plays);
        console.log(pageData);
        viewEventHandler.emit("view-selected", "plays", "playbook-overview-plays", plays)
    }


exports.onLoad = onLoad;
exports.selectMap = selectMap;