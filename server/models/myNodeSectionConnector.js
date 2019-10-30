
const myNodeType = require('./myNodeType');
const MyNodeConnector = require('./myNodeConnector');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');

class MyNodeSectionConnector extends MyNodeConnector {
  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SECTIONCONNECTOR);
    this.connectionType = null;

    this[MyNodePropNameParamRole.POWER] = '';
    this.connectors = [];
    this.lep2PsConnector = null;
    this.transformerConnector = false;
  }
}

module.exports = MyNodeSectionConnector;
