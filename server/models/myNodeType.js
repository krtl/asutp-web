const myNodeType = {
  UNKNOWN: 0,
  REGION: 1,
  LEP: 2,
  LEPCONNECTION: 3,
  PS: 4,
  PSCONNECTOR: 5,
  PSPART: 6,
  SECTION: 7,
  SECTIONCONNECTOR: 8,
  TRANSFORMER: 9,
  TRANSFORMERCONNECTOR: 10,
  EQUIPMENT: 11,
};

const requireParent = [
  myNodeType.LEPCONNECTION,
  myNodeType.PS,
  myNodeType.PSCONNECTOR,
  myNodeType.PSPART,
  myNodeType.SECTION,
  myNodeType.SECTIONCONNECTOR,
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
