const myNodeType = {
  UNKNOWN: 0,
  RES: 1,
  LEP: 2,
  LEPCONNECTION: 3,
  PS: 4,
  PSPART: 5,
  SECTION: 6,
  TRANSFORMER: 7,
  CONNECTOR: 8,
  EQUIPMENT: 9,
  // properties: {
  //   0: { name: 'unknown', value: 0, parentRequired: false },
  //   1: { name: 'RES', value: 0, parentRequired: false },
  //   2: { name: 'LEP', value: 0, parentRequired: false },
  //   3: { name: 'LEP Connection', value: 0, parentRequired: true },
  //   4: { name: 'PS', value: 0, parentRequired: true },
  //   5: { name: 'PS Part', value: 0, parentRequired: true },
  //   6: { name: 'Section', value: 0, parentRequired: true },
  //   7: { name: 'Transformer', value: 0, parentRequired: true },
  //   8: { name: 'Connector', value: 0, parentRequired: true },
  //   9: { name: 'Equipment', value: 0, parentRequired: true },
  // },
};

const requireParent = [ myNodeType.LEPCONNECTION,
  myNodeType.PS,
  myNodeType.PSPART,
  myNodeType.SECTION,
  myNodeType.TRANSFORMER,
  myNodeType.CONNECTOR,
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
