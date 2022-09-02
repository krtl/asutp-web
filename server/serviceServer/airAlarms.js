const request = require("request");
const MyStompServer = require("./myStompServer");
const commandsServer = require("./commandsServer");


let timerId;
let activeAlarms = [];
let regions = [];

const IsRegionMatched = (aRegionId) => {
    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        if (region.regionId == aRegionId)
        {
            return true;
        }
    }
    return false;
  };

const loadRegions = (cb) => {
    request(
        "https://api.ukrainealarm.com/api/v3/regions",
        {
            headers: {
                'Authorization': 'e1f4eaa1:5b5d5c7db68b64bc6211cac503376952'
            },
            method: 'GET',
            json: true     
          }, (err, resp, body) => {
          if (err) 
          {
            console.error(err);
          }
          else
          {
            //console.log(body);
            regions = [];
            const locRegions = body.states.slice(0, 10000);
            for (let i = 0; i < locRegions.length; i++) {
              const region = locRegions[i];
              //if (region.regionId == 20)
              //{
                regions.push(region);
                for (let j = 0; j < region.regionChildIds.length; j++) {
                    const regionChild = region.regionChildIds[j];
                    regions.push(regionChild);

                    for (let k = 0; k < regionChild.regionChildIds.length; k++) {
                        const regionChild1 = regionChild.regionChildIds[k];
                        regions.push(regionChild1);
                    }   
              //  }
              }
          }
          console.log("[AirAlarms] loaded with " + regions.length + " regions.");
        }
        }
      );    
  };


const ProcessAirAlerts = (cb) => {
    request(
        "https://api.ukrainealarm.com/api/v3/alerts",
        //"https://api.ukrainealarm.com/api/v3/alerts/1187",
        {
            headers: {
                'Authorization': 'e1f4eaa1:5b5d5c7db68b64bc6211cac503376952'
            },
            method: 'GET',
            json: true     
          }, (err, resp, body) => {
          if (err) 
          {
            console.error(err);
          }
          else
          {
            //console.log(body);
            let locActiveAlarms = [];
            const regions = body.slice(0, 10000);
            for (let i = 0; i < regions.length; i++) {
              const region = regions[i];
              if (IsRegionMatched(region.regionId))
              {
                //console.log(region.regionName + " " + region.lastUpdate + " " + region.activeAlerts.length);
                for (let j = 0; j < region.activeAlerts.length; j++) {
                    const activeAlert = region.activeAlerts[j];
                    console.log(activeAlert.regionId + " " + activeAlert.type + " " + activeAlert.lastUpdate);
                    locActiveAlarms.push(activeAlert);
                }
              }
          }

          activeAlarms.sort((a,b)=>a-b);
          locActiveAlarms.sort((a,b)=>a-b);

          if (JSON.stringify(activeAlarms) !== JSON.stringify(locActiveAlarms)) {
            
            console.debug("[AirAlarms] ActiveAirAlarm has changed from " + JSON.stringify(activeAlarms) + " to " + JSON.stringify(locActiveAlarms));
            
            activeAlarms = locActiveAlarms;

            MyStompServer.sendActiveAirAlarms(activeAlarms);
            commandsServer.SetActiveAirAlarms(activeAlarms);
          }    

        }
        }
      );    
  };


const initialize = () => {
  loadRegions();
  if (process.env.NOWTESTING === undefined) {
    timerId = setInterval(() => {
        ProcessAirAlerts();
    }, 20000);
    console.log("[AirAlarms] initialized.");
  }
};

const finalize = () => {
  if (process.env.NOWTESTING === undefined) {
    clearInterval(timerId);
    console.log("[AirAlarms] finalized.");
  }
};

const GetActiveAirAlarms = () => {
  // console.debug("GetActiveAirAlarms:", activeAlertIds);
  return activeAlarms;
};

const GetRegions = () => {
    return regions;
  };

//module.exports = MyAirAlarms;
module.exports.initialize = initialize;
module.exports.finalize = finalize;
module.exports.GetActiveAirAlarms = GetActiveAirAlarms;
module.exports.GetRegions = GetRegions;
