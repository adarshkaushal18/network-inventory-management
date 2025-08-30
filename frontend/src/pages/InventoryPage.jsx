import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField
} from "@mui/material";

import {
  getDevices,
  softDeleteDevice,
  restoreDevice,
  getAuditTrail
} from "../api/device";

import {
  GoogleMap,
  Marker,
  useJsApiLoader
} from "@react-google-maps/api";

import MainLayout from "../components/MainLayout";
import toast from "react-hot-toast";

const mapContainerStyle = {
  height: "300px",
  width: "100%"
};

const defaultCenter = { lat: 0, lng: 0 };

const InventoryPage = ({ currentUser, handleLogout }) => {
  const [devices, setDevices] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [openAuditId, setOpenAuditId] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [mapRef, setMapRef] = useState(null);

  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    getDevices()
      .then((res) => setDevices(res.data))
      .catch(() => toast.error("Failed to fetch devices"))
      .finally(() => setLoading(false));
  }, []);

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this device?")) return;
    try {
      await softDeleteDevice(id, { deletedBy: currentUser.username });
      setDevices((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isDeleted: true } : d))
      );
      toast.success("Device Deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Are you sure you want to restore this device?")) return;
    try {
      await restoreDevice(id, { restoredBy: currentUser.username });
      setDevices((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isDeleted: false } : d))
      );
      toast.success("Device Restored");
    } catch {
      toast.error("Failed to restore device");
    }
  };

  const handleAuditTrail = async (id) => {
    try {
      const res = await getAuditTrail(id);
      setAuditLogs(res.data);
      setOpenAuditId(id);
    } catch {
      toast.error("Failed to fetch audit trail");
    }
  };

  const logColor = (action) => {
    if (action === "DELETED") return "#e53935";
    if (action === "RESTORED") return "#4caf50";
    if (action === "UPDATED") return "#1e88e5";
    return "#4caf50";
  };

  const visibleDevices = Array.isArray(devices)
    ? devices
        .filter((d) => (showDeleted ? d.isDeleted : !d.isDeleted))
        .filter((d) =>
          `${d.componentName} ${d.ip} ${d.status}`
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        )
    : [];

  if (loading) {
    return (
      <MainLayout currentUser={currentUser} handleLogout={handleLogout}>
        <Typography>Loading...</Typography>
      </MainLayout>
    );
  }

  if (!devices.length) {
    return (
      <MainLayout currentUser={currentUser} handleLogout={handleLogout}>
        <Typography>No devices available. Add one first.</Typography>
      </MainLayout>
    );
  }

  const firstValid = visibleDevices.find((d) => d.latitude && d.longitude);
  const mapCenter = firstValid
    ? { lat: firstValid.latitude, lng: firstValid.longitude }
    : defaultCenter;

  return (
    <MainLayout currentUser={currentUser} handleLogout={handleLogout}>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          size="small"
          label="Search"
          placeholder="Search by name, ip, status"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{
            flexGrow: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#333" },
              "&:hover fieldset": { borderColor: "#555" },
              "&.Mui-focused fieldset": { borderColor: "#1976d2" },
            },
            "& .MuiInputLabel-root": { color: "#ccc" },
            "& .MuiInputLabel-root.Mui-focused": { color: "#1976d2" },
          }}
        />
        <Button
          variant="contained"
          onClick={() => setShowDeleted(!showDeleted)}
          color={showDeleted ? "secondary" : "primary"}
        >
          {showDeleted ? "Show Active Devices" : "Show Deleted Devices"}
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        }}
      >
        {visibleDevices.map((device) => (
          <Card key={device._id}>
            <CardContent>
              <Typography variant="h6">{device.componentName}</Typography>
              <Typography variant="body2">IP: {device.ip}</Typography>
              <Chip
                label={device.status === "active" ? "Active" : "Inactive"}
                color={device.status === "active" ? "success" : "warning"}
                size="small"
                sx={{ mt: 1 }}
              />
              <Stack direction="row" spacing={1} mt={2}>
                {!showDeleted &&
                  ["admin", "network-admin"].includes(currentUser.role) && (
                    <>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/edit-device/${device._id}`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleSoftDelete(device._id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                {showDeleted &&
                  ["admin", "network-admin"].includes(currentUser.role) && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleRestore(device._id)}
                      >
                        Restore
                      </Button>
                  )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAuditTrail(device._id)}
                >
                  View Audit Trail
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: "auto",
                    px: 1,
                    py: 0.5,
                    fontSize: "0.6rem",
                  }}
                  onClick={() => {
                    if (mapRef && device.latitude && device.longitude) {
                      mapRef.panTo({
                        lat: device.latitude,
                        lng: device.longitude,
                      });
                      mapRef.setZoom(20);
                    }
                  }}
                >
                  Map Marker
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog
        open={Boolean(openAuditId)}
        onClose={() => setOpenAuditId(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Audit Trail</DialogTitle>
        <DialogContent dividers>
          {auditLogs.length === 0 ? (
            <Typography>No audit logs available.</Typography>
          ) : (
            auditLogs.map((log, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Typography variant="caption">
                  [{new Date(log.timestamp).toLocaleString()}]{" "}
                  <span
                    style={{
                      color: logColor(log.action),
                      fontWeight: "bold",
                    }}
                  >
                    {log.action}
                  </span>{" "}
                  by <strong>{log.user}</strong>
                  {log.details ? ` - ${log.details}` : ""}
                </Typography>
              </Box>
            ))
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedDevice)}
        onClose={() => setSelectedDevice(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Device Details</DialogTitle>
        <DialogContent dividers>
          {selectedDevice && (
            <Stack spacing={1}>
              <Box>
                <Typography>
                  <strong>Name:</strong> {selectedDevice.componentName}
                </Typography>
                <Typography>
                  <strong>IP:</strong> {selectedDevice._id}
                </Typography>
                <Typography>
                  <strong>Status:</strong> {selectedDevice.status}
                </Typography>
                <Typography>
                  <strong>Location:</strong> {selectedDevice.latitude}, {selectedDevice.longitude}
                </Typography>
                {selectedDevice.details && (
                  <Typography>
                    <strong>Details:</strong> {selectedDevice.details}
                  </Typography>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <Typography variant="h6" mt={4} mb={2}>
        Device Location Map
      </Typography>
      <Card>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            onLoad={(map) => setMapRef(map)}
            zoom={6}
          >
            {visibleDevices.map((device) =>
              device.latitude && device.longitude ? (
                <Marker
                  key={device._id}
                  position={{ lat: device.latitude, lng: device.longitude }}
                  icon={{
                    url:
                      device.status?.toLowerCase() === "active"
                        ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  }}
                  title={`(${device.ip})`}
                  onClick={() => setSelectedDevice(device)}
                />
              ) : null
            )}
          </GoogleMap>
        ) : (
          <Typography variant="body2" color="textSecondary" align="center">
            Loading map...
          </Typography>
        )}
      </Card>
    </MainLayout>
  );
};

export default InventoryPage;