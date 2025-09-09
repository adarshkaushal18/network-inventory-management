import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "./MainLayout";
import { updateDevice } from "../api/device";
import { scanDevices } from "../api/scanner";
import toast from "react-hot-toast";
import { TextField, Typography, Paper, MenuItem, Button, Stack } from "@mui/material";

const EditDeviceForm = ({ allDevices, setAllDevices, currentUser }) => {
    // Component logic here
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState(null);

    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

    useEffect(() => {
        const device = allDevices.find((d) => d._id === id);
        if (device) {
            setFormData({ ...device });
        }
    }, [id, allDevices]);

    if (!formData) {
        return <MainLayout currentUser={currentUser}>Device not found</MainLayout>;
    }

    if(!["admin", "network-admin"].includes(currentUser?.role)) {
        return <MainLayout currentUser={currentUser}>Unauthorized</MainLayout>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleScanDevice = async () => {
        try {
        const devices = await scanDevices("192.168.1.0/24"); // change CIDR as needed
        const found = devices.responders.find((d) => d.ip === formData.ip);

        if (found) {
            setFormData((prev) => ({
            ...prev,
            ip: found.ip || prev.ip,
            componentName: found.hostname || prev.componentName,
            location: found.location || prev.location,
            status: "active", // ✅ mark active if found
            }));
            toast.success("Device scanned & updated!");
        } else {
            // not found in scan -> mark inactive
            setFormData((prev) => ({
            ...prev,
            status: "inactive",
            }));
            toast.error("Device not found on network. Status set to Inactive.");
        }
        } catch (err) {
        console.error(err);
        toast.error("Failed to scan device");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate form data
        const { componentName, ip , mac} = formData;
        if (!componentName || !ip || !mac) {
            toast.error("Component Name, IP address, and MAC address are required");
            return;
        }

        if (!ipRegex.test(formData.ip)) {
            toast.error("Invalid IP address");
            return;
        }
        if (!macRegex.test(formData.mac)) {
            toast.error("Invalid MAC address");
            return;
        }

        try {
            // Update device
            const res = await updateDevice(id, { ...formData, updatedBy: currentUser.id });
            setAllDevices((prev) =>
                prev.map((d) => (d._id === id ? res.data : d))
            );
            toast.success("Device updated successfully");
            navigate("/inventory");
        } catch (error) {
            console.error("Error updating device:", error);
            toast.error(error.response?.data?.message || "Failed to update device");
        }
    };

    return (
        <MainLayout currentUser={currentUser}>
            <Paper sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
                <Typography variant="h6" mb={2}>
                    Edit Device
                </Typography>

                <Stack spacing={2}>
                    <Button variant="outlined" onClick={handleScanDevice}>
                        🔍 Scan Device & Update Status
                    </Button>
                </Stack>

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Component Name"
                        fullWidth
                        margin="normal"
                        name="componentName"
                        value={formData.componentName}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="IP Address"
                        fullWidth
                        name="ip"
                        value={formData.ip}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="MAC Address"
                        fullWidth
                        margin="normal"
                        name="mac"
                        value={formData.mac}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                    select
                        label="Type"
                        fullWidth
                        margin="normal"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="physical">Physical</MenuItem>
                        <MenuItem value="virtual">Virtual</MenuItem>
                    </TextField>

                    <TextField
                    select
                        label="Status"
                        fullWidth
                        margin="normal"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>

                    <TextField
                        label="Manufacturer"
                        fullWidth
                        margin="normal"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                    />

                    <TextField
                        label="Serial No"
                        fullWidth
                        margin="normal"
                        name="serialNo"
                        value={formData.serialNo}
                        onChange={handleChange}
                    />

                    <TextField
                        label="Location"
                        fullWidth
                        margin="normal"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                    />

                    <TextField
                        label="Latitude"
                        fullWidth
                        margin="normal"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                    />

                    <TextField
                        label="Longitude"
                        fullWidth
                        margin="normal"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                    />

                    <Button type="submit" variant="contained" color="primary">
                        Update Device
                    </Button>
                </form>
            </Paper>
        </MainLayout>
    );
};

export default EditDeviceForm;
