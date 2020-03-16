const mongoose = require("mongoose");

const AuthUserActionSchema = new mongoose.Schema(
  {
    dt: {
      type: Date,
      default: Date.now
      // index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser"
    },
    action: String,
    params: String,
    host: String
  },
  {
    capped: { size: 10000000000 }
  }
);

AuthUserActionSchema.index({ user: 1, dt: -1 });

module.exports = mongoose.model("AuthUserAction", AuthUserActionSchema);
