process.env.RECALCULATION = "test_recalculation";
process.env.NOWTESTING = "test_recalculation";

const chai = require("chai");
const mongoose = require("mongoose");

const { expect } = chai;
const myDataModelNodes = require("../models/myDataModelNodes");
const paramValuesProcessor = require("../serviceBackground/paramValuesProcessor");
const myNodeState = require("../models/myNodeState");
const MyChains = require("../models/myChains");

const config = require("../../config");

let pss = [];
// let leps = [];

describe("mySchemaChainRecalculation", () => {
  before(done => {
    // plug in the promise library:
    mongoose.Promise = global.Promise;

    // mongoose.set("useNewUrlParser", true);
    //mongoose.set("useFindAndModify", false);
    // mongoose.set("useCreateIndex", true);
    // mongoose.set("useUnifiedTopology", true);
    mongoose.connect(config.dbUri, {
      // useMongoClient: true,
      autoIndex: process.env.NODE_ENV !== "production"
    });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    db.on("connected", () => {
      console.info(`We are connected to ${config.dbUri}`);
      myDataModelNodes.LoadFromDB(err => {
        expect(err).to.equal(null);

        paramValuesProcessor.initializeParamValuesProcessor(
          {
            useStompServer: false,
            useDbValueTracker: false
          },
          () => {
            pss = myDataModelNodes.GetAllPSsAsArray();
            // leps = myDataModelNodes.GetAllLEPsAsArray();

            done();
          }
        );
      });
    });
  });

  function testSwitchConnectorOn(connector) {
    expect(connector).to.be.an("object");
    connector.SetManualValue({
      nodeName: connector.name,
      cmd: "unblock",
      manualValue: 1
    });
    expect(connector.getSwitchedOn()).to.equal(true);
  }

  function testSwitchConnectorOff(connector) {
    expect(connector).to.be.an("object");
    connector.SetManualValue({
      nodeName: connector.name,
      cmd: "unblock",
      manualValue: 0
    });
    expect(connector.getSwitchedOn()).to.equal(false);
  }

  function testConnector(connector) {
    expect(connector).to.be.an("object");

    testSwitchConnectorOn(connector);
    testSwitchConnectorOff(connector);
  }

  function testSwitchSectionConnectorsOn(section) {
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      testSwitchConnectorOn(connector);
    }
  }

  function testSwitchSectionConnectorsOff(section) {
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      testSwitchConnectorOff(connector);
    }
  }

  function testSectionChaining(section) {
    expect(section).to.be.an("object");

    testSwitchSectionConnectorsOff(section);
    section.makeAChain();
    expect(section.chain.holders.length).to.equal(1);
    expect(section.chain.connectedElements.length).to.equal(0);
    expect(section.chain.disconnectedElements.length).to.equal(
      section.connectors.length
    );

    testSwitchSectionConnectorsOn(section);
    section.makeAChain();
    expect(section.chain.holders.length).to.equal(1);
    expect(section.chain.connectedElements.length).to.equal(
      section.connectors.length
    );
    expect(section.chain.disconnectedElements.length).to.equal(0);

    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      testConnector(connector);
    }
  }

  function testSectionPoweredON(section) {
    expect(section).to.be.an("object");
    section.SetManualValue({
      nodeName: section.name,
      cmd: "unblock",
      manualValue: 110
    });
    section.updatePoweredState();
    expect(section.powered, section.name).to.equal(myNodeState.POWERED_ON);
  }

  function testSectionPoweredOFF(section) {
    expect(section).to.be.an("object");
    section.SetManualValue({
      nodeName: section.name,
      cmd: "unblock",
      manualValue: 0
    });
    section.updatePoweredState();
    expect(section.powered).to.equal(myNodeState.POWERED_OFF);
  }

  function testSectionPowering(section) {
    expect(section).to.be.an("object");
    // expect(section.powered).to.equal(myNodeState.POWERED_UNKNOWN);

    testSectionPoweredON(section);
    testSectionPoweredOFF(section);
  }

  function testSec2SecConnector(connector) {
    testConnector(connector);

    // ..
  }

  function testPSPart(pspart) {
    for (let k = 0; k < pspart.sections.length; k += 1) {
      const section = pspart.sections[k];
      testSectionChaining(section);
      testSectionPowering(section);
    }

    for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
      const connector = pspart.sec2secConnectors[l];
      testSec2SecConnector(connector);
    }
  }

  function testPS(ps) {
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      testPSPart(pspart);
    }
  }

  function SwitchOffAllConnectors(ps) {
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        testSwitchSectionConnectorsOff(section);
      }
      for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
        const connector = pspart.sec2secConnectors[l];
        testSwitchConnectorOff(connector);
      }
    }
  }

  function SwitchOnAllConnectors(ps) {
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        testSwitchSectionConnectorsOn(section);
      }
      for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
        const connector = pspart.sec2secConnectors[l];
        testSwitchConnectorOn(connector);
      }
    }
  }

  function UnpowerAllSections(ps) {
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        testSectionPoweredOFF(section);
      }
    }
  }

  function PowerAllSections(ps) {
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        testSectionPoweredON(section);
      }
    }
  }

  function CheckIfAllTrustedConnectorsArePowered(ps, poweredState) {
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        if (section.powered === myNodeState.POWERED_UNKNOWN) {
          for (let l = 0; l < section.connectors.length; l += 1) {
            const connector = section.connectors[l];
            expect(connector.powered).to.equal(myNodeState.POWERED_UNKNOWN);
          }
        } else {
          for (let l = 0; l < section.connectors.length; l += 1) {
            const connector = section.connectors[l];
            expect(connector.powered).to.equal(poweredState);
          }
        }
      }
      for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
        const connector = pspart.sec2secConnectors[l];
        if (connector.fromSection != null) {
          if (connector.fromSection.powered === myNodeState.POWERED_UNKNOWN) {
            expect(connector.powered).to.equal(myNodeState.POWERED_UNKNOWN);
          } else {
            expect(connector.powered).to.equal(poweredState);
          }
        }
      }
    }
  }

  describe("TestChainsForAllPSs", () => {
    it("test all Sections", done => {
      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        testPS(ps);
      }

      done();
    });

    it("Unpower and disconnect all PSs", done => {
      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        SwitchOffAllConnectors(ps);
        UnpowerAllSections(ps);
      }
      MyChains.Recalculate();

      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        CheckIfAllTrustedConnectorsArePowered(ps, myNodeState.POWERED_OFF);
      }

      done();
    });

    it("Unpower and connect all PSs", done => {
      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        SwitchOnAllConnectors(ps);
        UnpowerAllSections(ps);
      }
      MyChains.Recalculate();

      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        CheckIfAllTrustedConnectorsArePowered(ps, myNodeState.POWERED_OFF);
      }

      done();
    });

    it("Power and disconnect all PSs", done => {
      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        SwitchOffAllConnectors(ps);
        UnpowerAllSections(ps);
      }
      MyChains.Recalculate();

      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        CheckIfAllTrustedConnectorsArePowered(ps, myNodeState.POWERED_OFF);
      }

      done();
    });

    it("Power and connect all PSs", done => {
      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        SwitchOnAllConnectors(ps);
        PowerAllSections(ps);
      }
      MyChains.Recalculate();

      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        CheckIfAllTrustedConnectorsArePowered(ps, myNodeState.POWERED_ON);
      }

      done();
    });
  });

  after(done => {
    paramValuesProcessor.finalizeParamValuesProcessor();
    mongoose.connection.close(done);
  });
});
