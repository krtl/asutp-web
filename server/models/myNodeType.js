const myNodeType = {
  UNKNOWN: 0,
  RES: 1,
  LEP: 2,
  LEPCONNECTION: 3,
  PS: 4,
  PSPART: 5,
  SECTION: 6,
  SECTIONCONNECTOR: 7,
  TRANSFORMER: 8,
  TRANSFORMERCONNECTOR: 9,
  EQUIPMENT: 10,
};

const requireParent = [
  myNodeType.LEPCONNECTION,
  myNodeType.PS,
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
