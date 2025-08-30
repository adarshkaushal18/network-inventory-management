import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/device"
});

export const getDevices = async () => API.get("/devices");
export const addDevice = async (deviceData) => API.post("/devices", deviceData);
export const updateDevice = async (id, deviceData) => API.put(`/devices/${id}`, deviceData);
export const softDeleteDevice = async (id, deviceData) => API.patch(`/devices/${id}/soft-delete`, deviceData);
export const restoreDevice = async (id, deviceData) => API.patch(`/devices/${id}/restore`, deviceData);
export const getAuditTrail = async (id) => API.get(`/devices/${id}/audit-trail`);
