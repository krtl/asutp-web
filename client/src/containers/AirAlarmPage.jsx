import React from "react";
import PropTypes from "prop-types";
import AirAlarmForm from "../components/AirAlarmForm";
import MyFetchClient from "./MyFetchClient";
import MyStompClient from "../modules/MyStompClient";
import { MakeUid } from "../modules/MyFuncs";

const MATCHING_ITEM_LIMIT = 2500;

let valuesUpdated = 0;
let timerId;

export default class AirAlarmPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cmdUid: "",
      fetchRequests: [],
      // abort: false,
      airAlarms: [],
      update: false,
      lastHistoryParam: sessionStorage.getItem('lastHistoryParam'),
    };

    this.reloadAirAlarms = this.reloadAirAlarms.bind(this);
  }


  reloadAirAlarms() {
    this.setState({
      airAlarms: [],
      activeAirAlarms: [],
    });

    const cmds = [
      {
        fetchUrl: "/prj/getAirAlarmsModel",
        fetchMethod: "get",
        fetchData: "",
        fetchCallback: (values) => {
          var regions = values.slice(0, MATCHING_ITEM_LIMIT);
          for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            region.lastUpdate = "";
            region.type = "";
          }          

          this.setState({
            airAlarms: regions,
          });

          MyStompClient.subscribeToActiveAirAlarms(value => {
            //console.log("ActiveAirAlarms: " + value);

            var activeAirAlarms = value.slice(0, MATCHING_ITEM_LIMIT);
            for (let i = 0; i < this.state.airAlarms.length; i++) {
              const locRegion = this.state.airAlarms[i];
              let b = false;
              for (let j = 0; j < activeAirAlarms.length; j++) {
                const activeAirAlarm = activeAirAlarms[j];
                if (activeAirAlarm.regionId === locRegion.regionId)
                {
                  locRegion.type = activeAirAlarm.type;
                  locRegion.lastUpdate = activeAirAlarm.lastUpdate;
                  b = true;
                  break;
                }  
              }
              if (!b)
              {
                locRegion.type = "";
                locRegion.lastUpdate = "";
              }
            }          
  
            this.setState({
              airAlarms: regions,
            });
          });
        },
      },
    ];

    this.setState({
      cmdUid: MakeUid(5),
      fetchRequests: cmds,
    });
  }

  componentDidMount() {
    timerId = setInterval(() => {
      if (valuesUpdated > 0) {
        valuesUpdated = 0;
        this.setState({
          update: true,
        });
      }
    }, 1000);
  }

  componentWillUnmount() {
    MyStompClient.unsubscribeFromActiveAirAlarms();
    clearInterval(timerId);

    this.setState({
      asutpCommunicationReses: [],
      paramValues: [],
    });
  }

  render() {
    return (
      <div>
        <AirAlarmForm
          airAlarms={this.state.airAlarms}
          activeAirAlarms={this.state.activeAirAlarms}
          onReloadAirAlarms={this.reloadAirAlarms}
          history={this.props.history}
        />
        <MyFetchClient
          cmdUid={this.state.cmdUid}
          fetchRequests={this.state.fetchRequests}
          // abort={this.state.abort}
          history={this.props.history}
        />
      </div>
    );
  }
}

AirAlarmPage.propTypes = {
  router: PropTypes.shape({
    history: PropTypes.object.isRequired,
  }),
};
