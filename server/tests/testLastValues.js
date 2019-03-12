const chai = require('chai');

const expect = chai.expect;
const lastValues = require('../values/lastValues');
const MyParamValue = require('../models/myParamValue');

describe('lastValues', () => {
  before((done) => {
    lastValues.init(
      { useDbValueTracker: false }, () => {
        done();
      });
  });

  it('getLastValuesCount() should return 0 if no values are passed in', () => {
    expect(lastValues.getLastValuesCount()).to.equal(0);
  });

  it('getLastValuesCount() should return 1 after one value passed in', () => {
    const pv = new MyParamValue('testParam', 0, new Date(), '');
    lastValues.setRawValue(pv);
    expect(lastValues.getLastValuesCount()).to.equal(1);
  });

  it('getLastValue() should return correct paramValue after issuing setRawValue()', () => {
    const pv1 = new MyParamValue('testParam1', 123, new Date(), '');
    lastValues.setRawValue(pv1);
    const pv2 = lastValues.getLastValue('testParam1');
    expect(pv2.value).to.equal(123);
  });

  it('getLastValue() should return correct paramValue after issuing setManualValue()', () => {
    // const pv1 = new MyParamValue('testParam1', 567, new Date(), '');
    lastValues.SetManualValue({ paramName: 'testParam1', manualValue: 567 });
    const pv2 = lastValues.getLastValue('testParam1');
    expect(pv2.value).to.equal(567);
  });

  it('getLastValue() after blocking should return manual paramValue after issuing setRawValue()', () => {
    const pv1 = new MyParamValue('testParam1', 890, new Date(), '');
    lastValues.BlockRawValues('testParam1');
    lastValues.setRawValue(pv1);
    const pv2 = lastValues.getLastValue('testParam1');
    expect(pv2.value).to.equal(567);
  });

  it('getLastValue() after unblocking should return raw paramValue after issuing setRawValue()', () => {
    const pv1 = new MyParamValue('testParam1', 890, new Date(), '');
    lastValues.UnblockRawValues('testParam1');
    lastValues.setRawValue(pv1);
    const pv2 = lastValues.getLastValue('testParam1');
    expect(pv2.value).to.equal(890);
  });

  it('clearLastValues() should return 0', () => {
    lastValues.ClearLastValues();
    expect(lastValues.getLastValuesCount()).to.equal(0);
  });
});
