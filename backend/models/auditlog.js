import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },
  action: { type: String, enum: ["CREATED", "UPDATED", "DELETED", "RESTORED"], required: true },
  user: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String},
});

export default mongoose.model("AuditLog", auditLogSchema);
