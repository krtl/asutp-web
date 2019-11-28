const logger = require("../logger");
const myDataModelNodes = require("../models/myDataModelNodes");
const MyNodePropNameParamRole = require("../models/MyNodePropNameParamRole");
const myNodeState = require("../models/myNodeState");
const MyNodeSection = require("../models/myNodeSection");
const moment = require("moment");

let chains = [];

let errs = 0;
function setError(text) {
  errs += 1;
  logger.error(`[Chains] ${text}`);
  // eslint-disable-next-line no-console
  console.error(text);
}

function HoldersCouldBeConnected(holders) {
  // means there are no collisions.
  const sections = [];
  for (let i = 0; i < holders.length; i += 1) {
    const holder = holders[i];
    if (holder instanceof MyNodeSection) {
      const section = holder;
      if (sections.indexOf(section) < 0) {
        sections.push(section);
      }
    }
  }
  if (sections.length > 1) {
    const section1 = sections[0];
    for (let k = 1; k < sections.length; k += 1) {
      const section2 = sections[k];
      if (
        section1[MyNodePropNameParamRole.VOLTAGE] !== "" &&
        section2[MyNodePropNameParamRole.VOLTAGE] !== ""
      ) {
        if (
          section1.powered !== myNodeState.POWERED_UNKNOWN &&
          section2.powered !== myNodeState.POWERED_UNKNOWN
        ) {
          if (section1.powered !== section2.powered) {
            // eslint-disable-next-line max-len
            setError(
              `[Chains][Recalculation] Warning! Collision with different Powered state on trusted sections within the one chain. Holders: "${section1.name}" = "${section1.powered}" and "${section2.name}" = "${section2.powered}"`
            );
            return false;
          }
        }
      }
    }
  }
  return true;
}

function Recalculate() {
  // making

  let start = moment();

  const pss = myDataModelNodes.GetAllPSsAsArray();

  // eslint-disable-next-line no-console
  console.debug(
    `GetAllPSsAsArray done in ${moment(moment().diff(start)).format(
      "mm:ss.SSS"
    )}`
  );
  start = moment();

  const leps = myDataModelNodes.GetAllLEPsAsArray();

  // eslint-disable-next-line no-console
  console.debug(
    `GetAllLEPsAsArray done in ${moment(moment().diff(start)).format(
      "mm:ss.SSS"
    )}`
  );
  start = moment();

  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    ps.makeChains();
  }

  // eslint-disable-next-line no-console
  console.debug(
    `MakeChanisForPSs done in ${moment(moment().diff(start)).format(
      "mm:ss.SSS"
    )}`
  );
  start = moment();

  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    lep.makeChains();
  }

  // eslint-disable-next-line no-console
  console.debug(
    `MakeChanisForLEPs done in ${moment(moment().diff(start)).format(
      "mm:ss.SSS"
    )}`
  );
  start = moment();

  for (let i = 0; i < leps.length; i += 1) {
    const lep1 = leps[i];
    for (let j = 0; j < lep1.lep2lepConnectors.length; j += 1) {
      const connector = lep1.lep2lepConnectors[j];
      if (connector.toNode) {
        const lep2 = connector.toNode;
        // if (connector.switchedOn) {
        if (
          HoldersCouldBeConnected(lep1.chain.holders.concat(lep2.chain.holders))
        ) {
          lep1.chain.join(lep2.chain);
        }
      }
    }
  }

  // eslint-disable-next-line no-console
  console.debug(
    `JoiningLEPSIntoChais done in ${moment(moment().diff(start)).format(
      "mm:ss.SSS"
    )}`
  );
  start = moment();

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

  // eslint-disable-next-line no-console
  console.debug(
    `Collecting chains on PSs done in ${moment(moment().diff(start)).format(
      "mm:ss.SSS"
    )}`
  );
  start = moment();

  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    if (chains.indexOf(lep.chain) < 0) {
      chains.push(lep.chain);
    }
  }

  // eslint-disable-next-line no-console
  console.debug(
    `Collecting chains on LEPs done in ${moment(moment().diff(start)).format(
      "mm:ss.SSS"
    )}`
  );
  start = moment();

  // powering
  for (let i = 0; i < chains.length; i += 1) {
    const chain = chains[i];
    errs = 0;

    const trustedSections = [];
    for (let j = 0; j < chain.holders.length; j += 1) {
      const holder = chain.holders[j];
      let trusted = false;
      if (holder instanceof MyNodeSection) {
        const section = holder;
        // section.updatePoweredState();
        if (section[MyNodePropNameParamRole.VOLTAGE] !== "") {
          if (section.powered !== myNodeState.POWERED_UNKNOWN) {
            trustedSections.push(section);
            trusted = true;
          }
        }
      }
      if (!trusted) {
        holder.kTrust = 0;
        chain.connectedElements.push(holder);
      }
    }
    if (trustedSections.length > 0) {
      chain.powered = trustedSections[0].powered;
      for (let j = 1; j < trustedSections.length; j += 1) {
        const section = trustedSections[j];
        if (section.powered !== chain.powered) {
          // eslint-disable-next-line max-len
          setError(
            `[Chains][Recalculation] Error! Different Powered state on trusted sections within the one chain: "${section.name}" = "${section.powered}" while "${trustedSections[0].name}" = "${trustedSections[0].powered}"`
          );
        }
      }
    } else {
      chain.powered = myNodeState.POWERED_UNKNOWN;
      for (let j = 0; j < chain.holders.length; j += 1) {
        const holder = chain.holders[j];
        if (holder.powered !== myNodeState.POWERED_UNKNOWN) {
          holder.doOnPoweredStateChanged(myNodeState.POWERED_UNKNOWN);
        }
      }
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

  // eslint-disable-next-line no-console
  console.debug(
    `Powering chains done in ${moment(moment().diff(start)).format(
      "mm:ss.SSS"
    )}`
  );
  start = moment();

  // powering for PS
  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    let newPowered = myNodeState.POWERED_UNKNOWN;
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        if (section.powered === myNodeState.POWERED_ON) {
          newPowered = myNodeState.POWERED_ON;
          break;
        } else if (section.powered === myNodeState.POWERED_OFF) {
          newPowered = myNodeState.POWERED_OFF;
        }
      }
    }
    if (ps.powered !== newPowered) {
      ps.doOnPoweredStateChanged(newPowered);
    }
  }

  // eslint-disable-next-line no-console
  console.debug(
    `Powering PSs done in ${moment(moment().diff(start)).format("mm:ss.SSS")}`
  );
}

module.exports.Recalculate = Recalculate;
module.exports.HoldersCouldBeConnected = HoldersCouldBeConnected;
