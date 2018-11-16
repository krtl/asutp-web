const myNodeType = {
  UNKNOWN: 0,
  REGION: 1,
  LEP: 2,
  LEPCONNECTION: 3,
  PS: 4,
  PSPART: 5,
  SECTION: 6,
  SECTIONCONNECTOR: 7,
  SEC2SECCONNECTOR: 8,
  TRANSFORMER: 9,
  TRANSFORMERCONNECTOR: 10,
  EQUIPMENT: 11,
};

const requireParent = [
  myNodeType.LEPCONNECTION,
  myNodeType.PS,
  myNodeType.PSPART,
  myNodeType.SECTION,
  myNodeType.SECTIONCONNECTOR,
  myNodeType.SEC2SECCONNECTOR,
  myNodeType.TRANSFORMER,
  myNodeType.TRANSFORMERCONNECTOR,
  myNodeType.EQUIPMENT,
];

function getNodesThatShouldHaveAParent() {
  return requireParent;
}

function isParentRequiredFor(nodeType) {
  return (requireParent.includes[nodeType]);
}

module.exports = myNodeType;
module.exports.isParentRequired = isParentRequiredFor;
module.exports.getParentRequiresTypes = getNodesThatShouldHaveAParent;
