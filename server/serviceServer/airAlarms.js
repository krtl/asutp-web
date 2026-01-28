const request = require("request");
const moment = require('moment');
const MyStompServer = require("./myStompServer");
const commandsServer = require("./commandsServer");


let timerId;
let activeAlarms = [];
let regions = [];

const IsRegionMatched = (aRegionId, ARegions) => {
    for (let i = 0; i < ARegions.length; i++) {
        const region = ARegions[i];
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
            const alarmRegions = body.slice(0, 10000);
            for (let i = 0; i < alarmRegions.length; i++) {
              const region = alarmRegions[i];
              if (IsRegionMatched(region.regionId, regions))
              {
                //console.log(region.regionName + " " + region.lastUpdate + " " + region.activeAlerts.length);
                for (let j = 0; j < region.activeAlerts.length; j++) {
                    const activeAlert = region.activeAlerts[j];
                    // console.log(activeAlert.regionId + " " + activeAlert.type + " " + activeAlert.lastUpdate);
                    if (!IsRegionMatched(region.regionId, locActiveAlarms)) //detected several idems with the same regionId
                    {
                        locActiveAlarms.push(activeAlert);
                    }
                }
              }
          }

          //activeAlarms.sort((a,b)=>a-b);
          locActiveAlarms.sort((a,b)=>a-b);

          if (JSON.stringify(activeAlarms) !== JSON.stringify(locActiveAlarms)) {
           
            const str = "[AirAlarms] ActiveAirAlarm has changed from " + JSON.stringify(activeAlarms) + " to " + JSON.stringify(locActiveAlarms);
            console.debug(str.substring(0,120)+"...");
            
            activeAlarms = locActiveAlarms;

            MyStompServer.sendActiveAirAlarms(activeAlarms);
            commandsServer.SetActiveAirAlarms(activeAlarms);
          }    
        }
        }
      );    
  };


  let lastTickDT = moment().day(0);

const initialize = () => {
  loadRegions();
  if (process.env.NOWTESTING === undefined) {
    timerId = setInterval(() => {
        ProcessAirAlerts();

        //update alarms on 7:30, so that blocked alarms due to the working time could be activated.
        current_time = moment().seconds(0).milliseconds(0);  
        if ((current_time.hour() == 7) && (current_time.minute() == 30) && (lastTickDT.day() !== current_time.day())) { // day has changed.
            console.log("[AirAlarms] ActiveAirAlarm updated on start of the working time.");
            commandsServer.SetActiveAirAlarms(activeAlarms);
            lastTickDT = moment();
        }

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
  console.debug("GetActiveAirAlarms: " + JSON.stringify(activeAlarms));
  return activeAlarms;
};

const GetRegions = () => {
    return regions;
  };

module.exports.initialize = initialize;
module.exports.finalize = finalize;
module.exports.GetActiveAirAlarms = GetActiveAirAlarms;
module.exports.GetRegions = GetRegions;
