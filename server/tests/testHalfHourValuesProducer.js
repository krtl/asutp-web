const moment = require('moment');
const MyParamValue = require('../models/myParamValue');
const halfHourValuesProducer = require('../dbInsertor/halfHourValuesProducer');

const TESTPARAMNAME = 'testParam3245646';
const TESTPARAMVALUE = '333.333';
const TESTPARAMQD = 'NA';
const PERIOD = 30; // minutes


describe('Test Producer HalfHourValues', () => {
  describe('No values has tracked', () => {
    it('should return last value', (done) => {
      const now = moment().minutes(0).seconds(0).milliseconds(0);
      const before = now.subtract(PERIOD, 'minutes');
      const lastValue = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE, before.toDate(), TESTPARAMQD);
      const trackedValues = [];

      halfHourValuesProducer.produceHalfHourParamValues(now.add(1, 'minutes'), lastValue, trackedValues, (halfHourValues) => {
        if (halfHourValues.length !== 1) { throw new Error('Wrong count!'); }
        const newValue = halfHourValues[0];
        if (newValue.paramName !== TESTPARAMNAME) { throw new Error('Wrong param name!'); }
        if (newValue.value !== TESTPARAMVALUE) { throw new Error('Wrong param value!'); }
        if (newValue.qd !== TESTPARAMQD) { throw new Error('Wrong param QD!'); }
        if (newValue.dt !== before.add(PERIOD, 'minutes').toDate()) { throw new Error('Wrong param DT!'); }

        done();
      });
    });
  });
});
