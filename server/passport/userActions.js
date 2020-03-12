const moment = require("moment");
const logger = require("../logger");
const DbUserAction = require("../dbmodels/authUserAction");

const myUserAction = {
  UNKNOWN: "",
  Signup: "Signup",
  ResetNodeCoordinates: "ResetNodeCoordinates",
  SaveNodeCoordinates: "SaveNodeCoordinates",
  SaveParamManualValue: "SaveParamManualValue",
  SaveConnectionManualValue: "SaveConnectionManualValue",
  AddNewCustomSchema: "SchemaAddNew",
  DeleteCustomSchema: "SchemaDelete",
  CustomSchemaNodeAdded: "SchemaNodeAdd",
  CustomSchemaNodeDeleted: "SchemaNodeDelete",
  SavePSLinkage: "SavePSLinkage"
};

const LogUserAction = (user, action, params, cb) => {
  const userActionData = {
    dt: moment(),
    user: user._id,
    action: action,
    params: params
  };

  const newUserAction = new DbUserAction(userActionData);
  newUserAction.save(err => {
    if (err) {
      logger.warn(`[LogUserAction] Failed: ${err.message}`);
    }
    if (cb) {
      return cb(err);
    }
  });
};

module.exports = myUserAction;

module.exports.LogUserAction = LogUserAction;
