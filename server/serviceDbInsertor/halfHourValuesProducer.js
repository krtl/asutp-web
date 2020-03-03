/* eslint-disable no-unused-vars */
/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const MyParamValue = require('../models/myParamValue');

const moment = require('moment');

const PERIOD = 30; // minutes

const getHalfHourMoment = (momentDt) => {
  const result = moment(momentDt);
  if (momentDt.minutes() <= 15) {
    result.minutes(0).seconds(0).milliseconds(0);
  } else if (momentDt.minutes() <= 45) {
    result.minutes(30).seconds(0).milliseconds(0);
  } else {
    result.add(1, 'hours').minutes(0).seconds(0).milliseconds(0);
  }
  return result;
};

const produceHalfHourParamValues = (currentMoment, lastValue, trackedValues, callback) => {
  const valuesForInsert = [];
  const valuesForUpdate = new Map();
  const valuesForTrackAgain = [];

  let lastMoment = moment(lastValue.dt).add(PERIOD, 'minutes').seconds(0).milliseconds(0);
  const missedMoments = [];
  if (lastMoment.isBefore(currentMoment)) {
    do {
      missedMoments.push(moment(lastMoment));
      lastMoment = moment(lastMoment).add(PERIOD, 'minutes');
    }
    while (lastMoment.isBefore(currentMoment));
  }

  let newValueIsTracked = false;
  if (trackedValues.length > 0) {
    let previousValue = lastValue.value;

    for (let i = 0; i < missedMoments.length; i += 1) {
      const newValue = new MyParamValue(lastValue.paramName, lastValue.value, missedMoments[i].toDate(), lastValue.qd);
      newValue.param = lastValue.param; 
      let avgValue = 0;
      let avgCount = 0;
      for (let j = 0; j < trackedValues.length; j += 1) {
        const locTrackedValue = trackedValues[j];
        const locTrackedMoment = moment(locTrackedValue.dt);
        const beforeTime = moment(missedMoments[i]).subtract(PERIOD / 2, 'minutes').subtract(1, 'seconds');   // !?
        const afterTime = moment(missedMoments[i]).add(PERIOD / 2, 'minutes').add(1, 'seconds');
        if (locTrackedMoment.isBetween(beforeTime, afterTime)) {
          avgValue += locTrackedValue.value;
          avgCount += 1;
          locTrackedValue.tag = 1;
        }
      }

      if (avgCount > 0) {
        newValue.value = avgValue / avgCount;
      } else {
                // use previos value
        newValue.value = previousValue;
      }
      previousValue = newValue.value;
      valuesForInsert.push(newValue);
    }

    for (let j = 0; j < trackedValues.length; j += 1) {
      const locTrackedValue = trackedValues[j];
      if (locTrackedValue.tag === undefined) {
        const locTrackedMoment = moment(locTrackedValue.dt);
        if (locTrackedMoment.isBefore(currentMoment)) {
          const dtMoment = getHalfHourMoment(locTrackedMoment);
          const dtKey = dtMoment.format('YYYY_MM_DD_HH_mm');
          const value = locTrackedValue.value;

          if (valuesForUpdate.has(dtKey)) {
            const locValue = valuesForUpdate.get(dtKey);
            locValue.value = (value + locValue.value) / 2;
            valuesForUpdate.set(dtKey, locValue);
          } else {
            const newValue = new MyParamValue(locTrackedValue.paramName, locTrackedValue.value, dtMoment.toDate(), locTrackedValue.qd);
            newValue.param = lastValue.param; 
            valuesForUpdate.set(dtKey, newValue);
          }
          locTrackedValue.tag = 1;
        }
      }
    }

    for (let j = 0; j < trackedValues.length; j += 1) {
      const locTrackedValue = trackedValues[j];
      if (locTrackedValue.tag === undefined) {
        valuesForTrackAgain.push(locTrackedValue);
      }
    }

    newValueIsTracked = true;
  }

  if (!newValueIsTracked) {
        // save the last tracked value again
    for (let i = 0; i < missedMoments.length; i += 1) {
      const locMoment = missedMoments[i];
      const newValue = new MyParamValue(lastValue.paramName, lastValue.value, locMoment.toDate(), lastValue.qd);
      newValue.param = lastValue.param; 
      valuesForInsert.push(newValue);
    }
  }


  callback(valuesForInsert, Array.from(valuesForUpdate.values()), valuesForTrackAgain);
};

module.exports.produceHalfHourParamValues = produceHalfHourParamValues;
module.exports.getHalfHourTime = getHalfHourMoment;
