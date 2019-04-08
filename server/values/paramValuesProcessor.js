/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const moment = require('moment');

const myNodeType = require('../models/myNodeType');
const MyDataModelNodes = require('../models/myDataModelNodes');
const lastValues = require('./lastValues');
const MyStompServer = require('./myStompServer');
const MyNodeStateValue = require('../models/myNodeStateValue');
const ampqRawValuesReceiver = require('./amqpRawValuesReceiver');
const dbNodeStateValuesTracker = require('./amqpInsertNodeStateValueSender');
const logger = require('../logger');

let timerId;
let recalculateSchema = false;

const initializeParamValuesProcessor = (setts) => {
  lastValues.init(
    { useDbValueTracker: setts.useDbValueTracker }, () => {
      recalculateSchema = true;

      MyDataModelNodes.SetPoweredStateChangedHandler((node, oldState, newState) => {
        logger.info(`[debug] State changed for Node: ${node.name} from ${oldState} to ${newState}.`);
        console.log(`State changed for ${node.name} ${node.nodeType} from ${oldState} to ${newState}. ${node.schemaNames}`);

        const nodeStateValue = new MyNodeStateValue(node.name, oldState, newState, new Date());
        dbNodeStateValuesTracker.TrackDbNodeStateValue(nodeStateValue);

        if (setts.useStompServer) {
          for (let i = 0; i < node.schemaNames.length; i += 1) {
            const schemaName = node.schemaNames[i];
            MyStompServer.sendNodeStateValue(schemaName, nodeStateValue);
          }
        }

        if (myNodeType.isSchemaRecalculationRequiredFor(node.nodeType)) {
          recalculateSchema = true;
        }
      });

      dbNodeStateValuesTracker.Start();

      ampqRawValuesReceiver.Start();
    });

  timerId = setInterval(() => {
    const recalcPSNames = [];
    const lastChanged = lastValues.getLastChanged();
    for (let i = 0; i < lastChanged.length; i += 1) {
      const paramName = lastChanged[i];
      const value = lastValues.getLastValue(paramName);
      const param = MyDataModelNodes.GetParam(paramName);
      if ((param) && (value)) {
        for (let j = 0; j < param.schemaNames.length; j += 1) {
          const psSchemaName = param.schemaNames[j];

          if (setts.useStompServer) {
            MyStompServer.sendParamValue(psSchemaName, value);
          }

          if (recalcPSNames.indexOf(psSchemaName) < 0) {
            recalcPSNames.push(psSchemaName);
          }
        }
      }
    }

    for (let i = 0; i < recalcPSNames.length; i += 1) {
      const ps = MyDataModelNodes.GetNode(recalcPSNames[i]);
      if (ps) {
        ps.recalculatePoweredState();
      } else {
        logger.warn(`[!] Can't recalculate PS state. Unknown PS: "${recalcPSNames[i]}"`);
      }
    }

    if (recalculateSchema) {
      recalculateSchema = false;

      const start = moment();

      MyDataModelNodes.RecalculateWholeShema();

      const duration = moment().diff(start);
      console.debug(`Schema recalculated in ${moment(duration).format('mm:ss.SSS')}`);


      // ..;
    }
  }, 3000);
};

const finalizeParamValuesProcessor = () => {
  clearInterval(timerId);
  MyDataModelNodes.StoreLastStateValues();
  lastValues.StoreBlockedParams();
};


module.exports.initializeParamValuesProcessor = initializeParamValuesProcessor;
module.exports.finalizeParamValuesProcessor = finalizeParamValuesProcessor;

