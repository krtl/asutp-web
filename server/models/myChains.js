const myDataModelNodes = require('../models/myDataModelNodes');
const paramValuesProcessor = require('../values/paramValuesProcessor');
const lastValues = require('../values/lastValues');
const MyParamValue = require('../models/myParamValue');
const myNodeState = require('../models/myNodeState');
const MyNodePropNameParamRole = require('../models/MyNodePropNameParamRole');

const chains = [];

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
    for (let j = 0; j < this.lep2lepConnectors.length; j += 1) {
      const connector = this.lep2lepConnectors[j];
      if (connector.toNode) {
        const lep2 = connector.toNode;
        // if (connector.switchedOn) {
        lep2.chain.append(lep1.chain);
        lep1.chain.elements.push(connector);
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
        if (section.powered !== chain.powered){
          setError(`[Chains][Recalculation] Different Powered staite on trusted sections within one chain! "${section.name}" = "${section.powered}" while "${trustedSections[0].name}" = "${trustedSections[0].powered}"`);
        }
      }
    }

    if (errs === 0) {
      for (let j = 0; j < chain.elements.length; j += 1) {
        const element = chain.elements[j];
        if (element.powered !== chain.powered) {
          this.doOnPoweredStateChanged(newPowered);
        }
      }
    }
  }
}


module.exports.Recalculate = Recalculate;
