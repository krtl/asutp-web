const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeLEP extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP);
    this.voltage = null;
    this.lep2lepConnectors = [];
    this.lep2psConnectors = [];
  }

  recalculatePoweredState(useLep2LepConnections) {
    let isConnected = false;
    let isDisconnected = false;
    let kTrustOfPoweredOff = -100;
    let kTrustOfPoweredOn = -100;

    for (let i = 0; i < this.lep2psConnectors.length; i += 1) {
      const connector = this.lep2psConnectors[i];
      // connector.setPoweredFromPsConnector();
      if (connector.powered === myNodeState.POWERED_ON) {
        isConnected = true;
        if (kTrustOfPoweredOn < connector.kTrust) { kTrustOfPoweredOn = connector.kTrust; }
      }
      if (connector.powered === myNodeState.POWERED_OFF) {
        if (connector.toNodeConnector.switchedOn) {
          isDisconnected = true;
          if (kTrustOfPoweredOff < connector.kTrust) { kTrustOfPoweredOff = connector.kTrust; }
        }
      }
    }

    if (useLep2LepConnections) {
      for (let i = 0; i < this.lep2lepConnectors.length; i += 1) {
        const connector = this.lep2lepConnectors[i];
        connector.recalculatePoweredState();
        if (connector.powered === myNodeState.POWERED_ON) {
          isConnected = true;
          if (kTrustOfPoweredOn < connector.kTrust) { kTrustOfPoweredOn = connector.kTrust; }
        }
        if (connector.powered === myNodeState.POWERED_OFF) {
          isDisconnected = true;
          if (kTrustOfPoweredOff < connector.kTrust) { kTrustOfPoweredOff = connector.kTrust; }
        }
      }
    }

    let newPowered = myNodeState.POWERED_UNKNOWN;
    if ((isConnected) && (kTrustOfPoweredOn >= kTrustOfPoweredOff)) {
      newPowered = myNodeState.POWERED_ON;
      this.kTrust = kTrustOfPoweredOn - 1;
    } else if (isDisconnected) {
      newPowered = myNodeState.POWERED_OFF;
      this.kTrust = kTrustOfPoweredOff - 1;
    } else if (useLep2LepConnections) {
      newPowered = myNodeState.POWERED_UNKNOWN;
      this.kTrust = -100;
    }

    if (this.powered !== newPowered) {
      this.doOnPoweredStateChanged(newPowered);
    }

    if (useLep2LepConnections) {
      for (let i = 0; i < this.lep2psConnectors.length; i += 1) {
        const connector = this.lep2psConnectors[i];
        connector.setPoweredFromLEP();
      }
    }
  }

}


module.exports = MyNodeLEP;
