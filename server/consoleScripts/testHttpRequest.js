const request = require("request");

request(
    //"https://api.ukrainealarm.com/api/v3/alerts",
    "https://api.ukrainealarm.com/api/v3/alerts/1187",
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
        console.log(body);
        const regions = body.slice(0, 10000);
        for (let i = 0; i < regions.length; i++) {
          const res = regions[i];
          console.log(res.regionName + " " + res.lastUpdate + " " + res.activeAlerts.length);
          for (let j = 0; j < res.activeAlerts.length; j++) {
            const activeAlert = res.activeAlerts[i];
            console.log(activeAlert.lastUpdate + " " + res.type);
          }
      }
    }
    }
  );