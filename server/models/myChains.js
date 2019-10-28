const logger = require('../logger');
const myDataModelNodes = require('../models/myDataModelNodes');
const MyNodePropNameParamRole = require('../models/MyNodePropNameParamRole');
const myNodeState = require('../models/myNodeState');

let chains = [];

let errs = 0;
function setError(text) {
  errs += 1;
  logger.error(`[Chains] ${text}`);
  // eslint-disable-next-line no-console
  console.error(text);
}


function Recalculate() {
  // making

  const pss = myDataModelNodes.GetAllPSsAsArray();
  const leps = myDataModelNodes.GetAllLEPsAsArray();

  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    ps.makeChains();
  }

  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    lep.makeChains();
  }

  for (let i = 0; i < leps.length; i += 1) {
    const lep1 = leps[i];
    for (let j = 0; j < lep1.lep2lepConnectors.length; j += 1) {
      const connector = lep1.lep2lepConnectors[j];
      if (connector.toNode) {
        const lep2 = connector.toNode;
        // if (connector.switchedOn) {
        if (lep2.chain !== null) {
          lep2.chain.append(lep1.chain);
          lep1.chain.connectedElements.push(connector);
        } else {
          lep1.chain.disconnectedElements.push(connector);
        }
      }
    }
  }

  // collecting

  chains = [];
  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        if (chains.indexOf(section.chain) < 0) {
          chains.push(section.chain);
        }
      }
    }
  }


  // powering
  for (let i = 0; i < chains.length; i += 1) {
    const chain = chains[i];
    errs = 0;

    const trustedSections = [];
    for (let j = 0; j < chain.sections.length; j += 1) {
      const section = chain.sections[j];
      section.recalculatePoweredState();
      if (section[MyNodePropNameParamRole.VOLTAGE] !== '') {
        trustedSections.push(section);
      }
    }
    if (trustedSections.length > 0) {
      chain.powered = trustedSections[0].powered;
      for (let j = 1; j < trustedSections.length; j += 1) {
        const section = trustedSections[j];
        if (section.powered !== chain.powered) {
          // eslint-disable-next-line max-len
          setError(`[Chains][Recalculation] Different Powered state on trusted sections within the one chain: "${section.name}" = "${section.powered}" while "${trustedSections[0].name}" = "${trustedSections[0].powered}"`);
        }
      }
    } else {
      chain.powered = myNodeState.POWERED_UNKNOWN;
    }

    if (errs === 0) {
      for (let j = 0; j < chain.connectedElements.length; j += 1) {
        const element = chain.connectedElements[j];
        if (element.powered !== chain.powered) {
          element.doOnPoweredStateChanged(chain.powered);
        }
      }
      let disconnectedPowered = myNodeState.POWERED_UNKNOWN;
      if (chain.powered !== myNodeState.POWERED_UNKNOWN) {
        disconnectedPowered = myNodeState.POWERED_OFF;
      }
      for (let j = 0; j < chain.disconnectedElements.length; j += 1) {
        const element = chain.disconnectedElements[j];
        if (element.powered !== disconnectedPowered) {
          element.doOnPoweredStateChanged(disconnectedPowered);
        }
      }
    }
  }
}


module.exports.Recalculate = Recalculate;
