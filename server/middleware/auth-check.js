const jwt = require("jsonwebtoken");
const AuthUser = require("mongoose").model("AuthUser");
const config = require("../../config");
const MyServerStatus = require("../serviceServer/serverStatus");


const debugUserActivity = true;
/**
 *  The Auth Checker middleware function.
 */


module.exports = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).end();
  }
  // get the last part from a authorization header string like "bearer token-value"
  const token = req.headers.authorization.split(" ")[1];

  // decode the token using a secret key-phrase
  return jwt.verify(token, config.jwtSecret, async (err, decoded) => {
    // the 401 code is for unauthorized status
    if (err) {
      return res.status(401).end();
    }

    const userId = decoded.sub;


    // check if a user exists
    const user = await AuthUser.findById(userId);
    if (!user) {
        return res.status(401).end();
      }
    req.user = user;

    if (debugUserActivity) {
        let remotehost = "";
        if (req.connection.remoteAddress) {
          remotehost = req.connection.remoteAddress.split(`:`).pop();
        } else if (req.headers["x-forwarded-for"]) {
          remotehost = req.headers["x-forwarded-for"].split(",")[0];
        }        
        console.debug(`[updateActivity] ${remotehost} "${userId}" detected as "${user.name}"`);
        MyServerStatus.addIpUserCorrespondense(remotehost, user.name);
      }

      // inc activity
      await AuthUser.updateOne(
        { _id: user.id },
        { $inc: { 'activity': 1 } }
        //   if (debugUserActivity) {
        //     if (err) {
        //       console.warn(
        //         `[updateActivity] Something wrong when updateactivity for "${user.name}", Error: ${err}`
        //       )
        //     }
        //     else {
        //       console.debug(
        //         `[updateActivity] updated for "${user.name}" modified="${res.n}"`
        //       );
        //     }
        //   }
        // }
      );
      return next();



    // return AuthUser.findById(userId, (userErr, user) => {
    //   if (userErr || !user) {
    //     return res.status(401).end();
    //   }

    //   req.user = user;

    //   if (debugUserActivity) {
    //     let remotehost = "";
    //     if (req.connection.remoteAddress) {
    //       remotehost = req.connection.remoteAddress.split(`:`).pop();
    //     } else if (req.headers["x-forwarded-for"]) {
    //       remotehost = req.headers["x-forwarded-for"].split(",")[0];
    //     }        
    //     console.debug(`[updateActivity] ${remotehost} "${userId}" detected as "${user.name}"`);
    //     MyServerStatus.addIpUserCorrespondense(remotehost, user.name);
    //   }

    //   // inc activity
    //   AuthUser.updateOne(
    //     { _id: user.id },
    //     { $inc: { 'activity': 1 } },
    //     (err, res) => {
    //       if (debugUserActivity) {
    //         if (err) {
    //           console.warn(
    //             `[updateActivity] Something wrong when updateactivity for "${user.name}", Error: ${err}`
    //           )
    //         }
    //         else {
    //           console.debug(
    //             `[updateActivity] updated for "${user.name}" modified="${res.n}"`
    //           );
    //         }
    //       }
    //     }
    //   );

    //   return next();
    // });
  });
};
