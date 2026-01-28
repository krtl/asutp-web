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

const LogUserAction = async (user, action, params, req, cb) => {
  let remotehost = "";

  if (req.connection.remoteAddress) {
    remotehost = req.connection.remoteAddress.split(`:`).pop();
  } else if (req.headers["x-forwarded-for"]) {
    remotehost = req.headers["x-forwarded-for"].split(",")[0];
  }

  const userActionData = {
    dt: moment(),
    user: user._id,
    action: action,
    params: params,
    host: remotehost
  };

  const newUserAction = new DbUserAction(userActionData);
  try
  {
    await newUserAction.save();
  } catch (err) {
      logger.warn(`[LogUserAction] Failed: ${err.message}`);
      if (cb) {
      return cb(err);
    }
  } 
  
};

module.exports = myUserAction;

module.exports.LogUserAction = LogUserAction;
