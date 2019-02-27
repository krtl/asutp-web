const myNodeType = {
  UNKNOWN: 0,
  REGION: 1,
  LEP: 2,
  LEP2PSCONNECTION: 3,
  LEP2LEPCONNECTION: 4,
  PS: 5,
  PSPART: 6,
  SECTION: 7,
  SECTIONCONNECTOR: 8,
  SEC2SECCONNECTOR: 9,
  TRANSFORMER: 10,
  TRANSFORMERCONNECTOR: 11,
  EQUIPMENT: 12,
};

const requireParent = [
  myNodeType.LEP2PSCONNECTION,
  myNodeType.LEP2LEPCONNECTION,
  myNodeType.PS,
  myNodeType.PSPART,
  myNodeType.SECTION,
  myNodeType.SECTIONCONNECTOR,
  myNodeType.SEC2SECCONNECTOR,
  myNodeType.TRANSFORMER,
  myNodeType.TRANSFORMERCONNECTOR,
  myNodeType.EQUIPMENT,
];

const requireSchemaRecalculation = [
  myNodeType.LEP,
  myNodeType.LEP2PSCONNECTION,
  myNodeType.LEP2LEPCONNECTION,
  myNodeType.PS,
];

function getNodesThatShouldHaveAParent() {
  return requireParent;
}

function isParentRequiredFor(nodeType) {
  return (requireParent.indexOf(nodeType) > -1);
}

function isSchemaRecalculationRequiredFor(nodeType) {
  return (requireSchemaRecalculation.indexOf(nodeType) > -1);
}

module.exports = myNodeType;
module.exports.isParentRequiredFor = isParentRequiredFor;
module.exports.isSchemaRecalculationRequiredFor = isSchemaRecalculationRequiredFor;
module.exports.getParentRequiresTypes = getNodesThatShouldHaveAParent;
