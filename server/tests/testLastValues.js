const chai = require('chai');
const expect = chai.expect;
const lastValues = require('../values/lastValues');
const MyParamValue = require('../models/myParamValue');

describe('lastValues', () => {
  it('getLastValuesCount() should return 0 if no values are passed in', () => {
    expect(lastValues.getLastValuesCount()).to.equal(0);
  });

  it('getLastValuesCount() should return 1 after one value passed in', () => {
    const pv = new MyParamValue('testParam', '0', new Date(), '');
    lastValues.setLastValue(pv);
    expect(lastValues.getLastValuesCount()).to.equal(1);
  });

  it('getLastValue() should return correct paramValue after issuing getLastValue()', () => {
    const pv1 = new MyParamValue('testParam1', '123', new Date(), '');
    lastValues.setLastValue(pv1);
    const pv2 = lastValues.getLastValue('testParam1');
    expect(pv2.value).to.equal('123');
  });

  it('clearLastValues() should return 0', () => {
    lastValues.clearLastValues();
    expect(lastValues.getLastValuesCount()).to.equal(0);
  });
});
