const moment = require('moment');
const MyParamValue = require('../models/myParamValue');
const halfHourValuesProducer = require('../dbInsertor/halfHourValuesProducer');

const TESTPARAMNAME = 'testParam3245646';
const TESTPARAMVALUE = 333.333;
const TESTPARAMVALUE1 = 111.111;
const TESTPARAMVALUE2 = 333.333;
const TESTPARAMVALUE_AVERAGE_1_2 = 222.222;
const TESTPARAMQD = 'NA';
const PERIOD = 30; // minutes


describe('Test Producer HalfHourValues', () => {
  describe('No values has tracked', () => {
    it('should return last value', (done) => {
      const now = moment().minutes(0).seconds(0).milliseconds(0);
      const before = moment(now).subtract(PERIOD, 'minutes');
      const lastValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE, before.toDate(), TESTPARAMQD);
      const trackedValues = [];

      halfHourValuesProducer.produceHalfHourParamValues(moment(now).add(1, 'minutes'), lastValue, trackedValues, (halfHourValues) => {
        if (halfHourValues.length !== 1) { throw new Error('Wrong count!'); }
        const newValue = halfHourValues[0];
        if (newValue.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue.value !== TESTPARAMVALUE) { throw new Error('Wrong param value!'); }
        if (newValue.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue.dt).isSame(moment(before).add(PERIOD, 'minutes'))) { throw new Error('Wrong param DT!'); }

        done();
      });
    });

    it('should return last value two times', (done) => {
      const now = moment().minutes(0).seconds(0).milliseconds(0);
      const before = moment(now).subtract(PERIOD * 2, 'minutes');
      const lastValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE, before.toDate(), TESTPARAMQD);
      const trackedValues = [];

      halfHourValuesProducer.produceHalfHourParamValues(moment(now).add(1, 'minutes'), lastValue, trackedValues, (halfHourValues) => {
        if (halfHourValues.length !== 2) { throw new Error('Wrong count!'); }
        const newValue1 = halfHourValues[0];
        if (newValue1.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue1.value !== TESTPARAMVALUE) { throw new Error('Wrong param value!'); }
        if (newValue1.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue1.dt).isSame(moment(before).add(PERIOD, 'minutes'))) { throw new Error('Wrong param DT!'); }

        const newValue2 = halfHourValues[1];
        if (newValue2.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue2.value !== TESTPARAMVALUE) { throw new Error('Wrong param value!'); }
        if (newValue2.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue2.dt).isSame(moment(before).add(PERIOD * 2, 'minutes'))) { throw new Error('Wrong param DT!'); }

        done();
      });
    });
  });

  describe('One value has tracked', () => {
    it('should return tracked value', (done) => {
      const now = moment().minutes(0).seconds(0).milliseconds(0);
      const before = moment(now).subtract(PERIOD, 'minutes');
      const lastValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE, before.toDate(), TESTPARAMQD);
      const trackedValues = [];
      const trackedValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE1, moment(before).add(25, 'minutes').toDate(), TESTPARAMQD);
      trackedValues.push(trackedValue);

      halfHourValuesProducer.produceHalfHourParamValues(moment(now).add(1, 'minutes'), lastValue, trackedValues, (halfHourValues) => {
        if (halfHourValues.length !== 1) { throw new Error('Wrong count!'); }
        const newValue = halfHourValues[0];
        if (newValue.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue.value !== TESTPARAMVALUE1) { throw new Error('Wrong param value!'); }
        if (newValue.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue.dt).isSame(moment(before).add(PERIOD, 'minutes'))) { throw new Error('Wrong param DT!'); }

        done();
      });
    });

    it('should return tracked value two times', (done) => {
      const now = moment().minutes(0).seconds(0).milliseconds(0);
      const before = moment(now).subtract(PERIOD * 2, 'minutes');
      const lastValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE, before.toDate(), TESTPARAMQD);
      const trackedValues = [];
      const trackedValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE1, moment(before).add(25, 'minutes').toDate(), TESTPARAMQD);
      trackedValues.push(trackedValue);

      halfHourValuesProducer.produceHalfHourParamValues(moment(now).add(1, 'minutes'), lastValue, trackedValues, (halfHourValues) => {
        if (halfHourValues.length !== 2) { throw new Error('Wrong count!'); }
        const newValue1 = halfHourValues[0];
        if (newValue1.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue1.value !== TESTPARAMVALUE1) { throw new Error('Wrong param value!'); }
        if (newValue1.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue1.dt).isSame(moment(before).add(PERIOD, 'minutes'))) { throw new Error('Wrong param DT!'); }

        const newValue2 = halfHourValues[1];
        if (newValue2.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue2.value !== TESTPARAMVALUE1) { throw new Error('Wrong param value!'); }
        if (newValue2.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue2.dt).isSame(moment(before).add(PERIOD * 2, 'minutes'))) { throw new Error('Wrong param DT!'); }

        done();
      });
    });
  });

  describe('Two values has tracked', () => {
    it('should return average value', (done) => {
      const now = moment().minutes(0).seconds(0).milliseconds(0);
      const before = moment(now).subtract(PERIOD, 'minutes');
      const lastValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE, before.toDate(), TESTPARAMQD);
      const trackedValues = [];
      const trackedValue1 = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE1, moment(before).add(20, 'minutes').toDate(), TESTPARAMQD);
      trackedValues.push(trackedValue1);
      const trackedValue2 = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE2, moment(before).add(25, 'minutes').toDate(), TESTPARAMQD);
      trackedValues.push(trackedValue2);

      halfHourValuesProducer.produceHalfHourParamValues(moment(now).add(1, 'minutes'), lastValue, trackedValues, (halfHourValues) => {
        if (halfHourValues.length !== 1) { throw new Error('Wrong count!'); }
        const newValue = halfHourValues[0];
        if (newValue.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue.value !== TESTPARAMVALUE_AVERAGE_1_2) { throw new Error('Wrong param value!'); }
        if (newValue.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue.dt).isSame(moment(before).add(PERIOD, 'minutes'))) { throw new Error('Wrong param DT!'); }

        done();
      });
    });

    it('should return average value two times', (done) => {
      const now = moment().minutes(0).seconds(0).milliseconds(0);
      const before = moment(now).subtract(PERIOD * 2, 'minutes');
      const lastValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE, before.toDate(), TESTPARAMQD);
      const trackedValues = [];
      const trackedValue1 = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE1, moment(before).add(20, 'minutes').toDate(), TESTPARAMQD);
      trackedValues.push(trackedValue1);
      const trackedValue2 = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE2, moment(before).add(25, 'minutes').toDate(), TESTPARAMQD);
      trackedValues.push(trackedValue2);

      halfHourValuesProducer.produceHalfHourParamValues(moment(now).add(1, 'minutes'), lastValue, trackedValues, (halfHourValues) => {
        if (halfHourValues.length !== 2) { throw new Error('Wrong count!'); }
        const newValue1 = halfHourValues[0];
        if (newValue1.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue1.value !== TESTPARAMVALUE_AVERAGE_1_2) { throw new Error('Wrong param value!'); }
        if (newValue1.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue1.dt).isSame(moment(before).add(PERIOD, 'minutes'))) { throw new Error('Wrong param DT!'); }

        const newValue2 = halfHourValues[1];
        if (newValue2.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue2.value !== TESTPARAMVALUE_AVERAGE_1_2) { throw new Error('Wrong param value!'); }
        if (newValue2.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue2.dt).isSame(moment(before).add(PERIOD * 2, 'minutes'))) { throw new Error('Wrong param DT!'); }

        done();
      });
    });

    it('should return tracked value each time', (done) => {
      const now = moment().minutes(0).seconds(0).milliseconds(0);
      const before = moment(now).subtract(PERIOD * 2, 'minutes');
      const lastValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE, before.toDate(), TESTPARAMQD);
      const trackedValues = [];
      const trackedValue1 = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE1, moment(before).add(20, 'minutes').toDate(), TESTPARAMQD);
      trackedValues.push(trackedValue1);
      const trackedValue2 = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE2, moment(before).add(PERIOD + 20, 'minutes').toDate(), TESTPARAMQD);
      trackedValues.push(trackedValue2);

      halfHourValuesProducer.produceHalfHourParamValues(moment(now).add(1, 'minutes'), lastValue, trackedValues, (halfHourValues) => {
        if (halfHourValues.length !== 2) { throw new Error('Wrong count!'); }
        const newValue1 = halfHourValues[0];
        if (newValue1.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue1.value !== TESTPARAMVALUE1) { throw new Error('Wrong param value!'); }
        if (newValue1.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue1.dt).isSame(moment(before).add(PERIOD, 'minutes'))) { throw new Error('Wrong param DT!'); }

        const newValue2 = halfHourValues[1];
        if (newValue2.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue2.value !== TESTPARAMVALUE2) { throw new Error('Wrong param value!'); }
        if (newValue2.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (!moment(newValue2.dt).isSame(moment(before).add(PERIOD * 2, 'minutes'))) { throw new Error('Wrong param DT!'); }

        done();
      });
    });
  });
});
