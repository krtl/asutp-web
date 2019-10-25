const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeLEP extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP);
    this.voltage = null;
    this.lep2lepConnectors = [];
    this.lep2psConnectors = [];
    this.chain = null;
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

  makeChains() {
    this.chain = null;
    const connectedSections = [];

    for (let i = 0; i < this.lep2psConnectors.length; i += 1) {
      const connector = this.lep2psConnectors[i];
      if (connector.toNodeConnector.switchedOn) {
        const section = connector.toNodeConnector.parentNode;
        connectedSections.push(section);
      }
    }

    if (connectedSections.length > 1) {
      this.chain = connectedSections[0].chain;
      for (let k = 1; k < connectedSections.length; k += 1) {
        const section = connectedSections[k];
        this.chain.append(section.chain);
        section.chain = this.chain;
      }
      this.chain.elements.push(this);
    }

    // lep2lep connectors should be processed externaly

  }
}


module.exports = MyNodeLEP;
