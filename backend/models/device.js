import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  componentName: { type: String, required: true },
  ip: { type: String, required: true },
  mac: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  type: { type: String, enum: ["physical", "virtual"], required: true },
  manufacturer: String,
  serialNo: String,
  latitude: Number,
  longitude: Number,
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Device", deviceSchema);
