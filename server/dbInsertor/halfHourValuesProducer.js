/* eslint-disable no-unused-vars */
/* eslint max-len: ["error", { "code": 300 }] */
// const config = require('../../config');
const MyParamValue = require('../models/myParamValue');

const moment = require('moment');

const PERIOD = 30; // minutes

const produceHalfHourParamValues = (currentMoment, lastValue, trackedValues, callback) => {
  const result = [];
  let lastMoment = moment(lastValue.dt).add(PERIOD, 'minutes').seconds(0).milliseconds(0);
  if (lastMoment.isBefore(currentMoment)) {
    const missedMoments = [];
    do {
      missedMoments.push(moment(lastMoment));
      lastMoment = lastMoment.add(PERIOD, 'minutes');
    }
    while (lastMoment.isBefore(currentMoment));

    let newValueIsTracked = false;
    if (trackedValues.length > 0) {
      let previousValue = lastValue.value;
      for (let i = 0; i < missedMoments; i += 1) {
        const newValue = new MyParamValue(lastValue.paramName, lastValue.value, lastValue.qd, lastValue.dt);
        newValue.dt = missedMoments[i].toDate();
        let avgValue = 0;
        let avgCount = 0;
        for (let j = 0; j < trackedValues.length; j += 1) {
          const locTrackedValue = trackedValues[j];
          const locTrackedMoment = moment(locTrackedValue.dt);
          const beforeTime = missedMoments[i].substract(PERIOD / 2, 'minutes').substract(1, 'seconds');   // !?
          const afterTime = missedMoments[i].add(PERIOD / 2, 'minutes').add(1, 'seconds');
          if (locTrackedMoment.isBetween(beforeTime, afterTime)) {
            avgValue += locTrackedValue.value;
            avgCount += 1;
          }
        }

        if (avgCount > 0) {
          newValue.value = avgValue / avgCount;
        } else {
                // use previos value
          newValue.value = previousValue;
        }
        previousValue = newValue.value;
        result.push(newValue);
      }

      newValueIsTracked = true;
    }

    if (!newValueIsTracked) {
        // save the last tracked value again
      missedMoments.forEach((locMoment) => {
        const newValue = lastValue;
        newValue.dt = locMoment.toDate();
        result.push(newValue);
      });
    }
  }

  callback(result);
};

module.exports.produceHalfHourParamValues = produceHalfHourParamValues;
