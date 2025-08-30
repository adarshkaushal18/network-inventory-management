import express from 'express';
import Device from '../models/device.js';
import AuditLog from '../models/auditlog.js';

const router = express.Router();

// GET all devices (exclude deleted)
router.get('/devices', async (req, res) => {
  try {
    const devices = await Device.find({});
    res.json(devices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching devices' });
  }
});

// POST a new device
router.post('/devices', async (req, res) => {
  try {
    const existingDevice = await Device.findOne({ mac: req.body.mac });
    if (existingDevice) {
      return res.status(400).json({ message: 'Device with this MAC address already exists' });
    }

    const newDevice = new Device(req.body);
    await newDevice.save();

    // Create an audit log entry
    await AuditLog.create({
      deviceId: newDevice._id,
      action: "CREATED",
      user: req.body.addedBy || "admin",
      details: `Device created: ${newDevice.componentName}`,
      timestamp: new Date(),
    });
  
    res.status(201).json(newDevice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating device', error });
  }
});

// PUT (update a device)
router.put('/devices/:id', async (req, res) => {
  try {
    const { updatedBy, ...updatedFields } = req.body;

    const existingDevice = await Device.findById(req.params.id);
    if (!existingDevice) {
      return res.status(404).json({ message: 'Device not found' });
    }

    const updatedDevice = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Track Changes
    const changes = [];
    for (const key in updatedFields) {
      if (updatedFields[key] !== existingDevice[key]) {
        changes.push({ field: key, from: existingDevice[key], to: updatedFields[key] });
      }
    }

    const details = changes.length ? changes.map(change => `Field '${change.field}' changed from '${change.from}' to '${change.to}'`).join(", ") : "No changes";

    // Create an audit log entry
    await AuditLog.create({
      deviceId: updatedDevice._id,
      action: "UPDATED",
      user: req.body.updatedBy || "admin",
      details: `Device updated: ${updatedDevice.componentName}. Changes: ${details}`,
      timestamp: new Date(),
    });

    res.json(updatedDevice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating device', error });
  }
});

// PATCH soft delete
router.patch("/devices/:id/soft-delete", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    if (device.isDeleted) {
      return res.status(400).json({ message: 'Device is already deleted' });
    }

    device.isDeleted = true;
    await device.save();

    // Create an audit log entry
    await AuditLog.create({
      deviceId: device._id,
      action: "DELETED",
      user: req.body.deletedBy || "admin",
      timestamp: new Date(),
    });

    res.json({message: 'Device soft deleted successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error soft deleting device', error });
  }
});

// PATCH restore
router.patch("/devices/:id/restore", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    if (!device.isDeleted) {
      return res.status(400).json({ message: 'Device is not deleted' });
    }

    device.isDeleted = false;
    await device.save();

    // Create an audit log entry
    await AuditLog.create({
      deviceId: device._id,
      action: "RESTORED",
      user: req.body.restoredBy || "admin",
      details: `Device restored: ${device.componentName}`,
      timestamp: new Date(),
    });

    res.json({message: 'Device restored successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error restoring device', error });
  }
});

// Get audit trail for a device
router.get("/devices/:id/audit-trail", async (req, res) => {
  try {
    const auditLogs = await AuditLog.find({ deviceId: req.params.id }).sort({ timestamp: -1 });
    res.json(auditLogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching audit trail' });
  }
});

export default router;
