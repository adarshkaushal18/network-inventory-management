import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "./MainLayout";

import {
    TextField,
    Button,
    Typography,
    Paper,
    MenuItem,
    Select,
    InputLabel,
    FormControl
} from "@mui/material";

import toast from "react-hot-toast";
import { addDevice } from "../api/device";
import { scanDevices } from "../api/scanner";

const AddDeviceForm = ({ allDevices, setAllDevices, currentUser, handleLogout }) => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        componentName: "",
        type: "physical",
        status: "active",
        ip: "",
        mac: "",
        location: "",
        manufacturer: "",
        serialNo: "",
        latitude: "",
        longitude: ""
    });

    const [scannedDevices, setScannedDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState("");
    const [subnet, setSubnet] = useState("");

    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    const cidrRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/;

    const isValidCIDR = (cidr) => cidrRegex.test(String(cidr).trim());

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { componentName, ip, mac } = formData;
        if (!componentName || !ip || !mac) {
            toast.error("Component Name, IP Address, and MAC Address are required");
            return;
        }

        if (!ipRegex.test(ip)) {
            toast.error("Invalid IP Address format");
            return;
        }

        if (!macRegex.test(formData.mac)) {
            toast.error("Invalid MAC Address format");
            return;
        }

        try {
            const res = await addDevice({ ...formData, addedBy: currentUser.username });
            setAllDevices(prev => Array.isArray(prev) ? [...prev, res.data] : [res.data]);
            toast.success("Device added successfully");
            navigate("/inventory");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add device");
        }
    };

    const handleScan = async () => {
        const input = subnet.trim();

        if (!isValidCIDR(input)) {
            toast.error("Invalid CIDR format");
            return;
        }

        try {
            const res = await scanDevices(input);
            if (res.responders.length === 0) {
                toast.error("No devices found");
            } else {
                setScannedDevices(res.responders);
                toast.success("Device scan successful");
            }
        } catch (error) {
            toast.error("Scan failed: " + (error.response?.data?.message || "Failed to scan devices"));
        }
    };

    const handleDeviceSelect = (e) => {
        const ip = e.target.value;
        setSelectedDevice(ip);
        const device = scannedDevices.find((d) => d.ip === ip);
        if (device) {
            setFormData((prev) => ({
                ...prev,
                componentName: device.hostname || "",
                ip: device.ip || "",
                manufacturer: device.description || "",
            }));
        }
    };

    return (
        <MainLayout currentUser={currentUser} handleLogout={handleLogout}>
            <Paper sx={{ p: 3, maxWidth: 500, mx: "auto"}}>
                <Typography variant="h5" mb={2}>Add New Device</Typography>

                <TextField
                    label="Subnet"
                    value={subnet}
                    onChange={(e) => setSubnet(e.target.value)}
                    placeholder="Enter subnet in CIDR format e.g. 192.168.1.0/24"
                    fullWidth
                    autoComplete="off"
                    sx={{ mb: 2 }}
                    error={subnet.length > 0 && !isValidCIDR(subnet)}
                    helperText={subnet.length > 0 && !isValidCIDR(subnet) ? "Invalid CIDR format" : " "}
                    margin="normal"
                />

                <Button variant="outlined" onClick={handleScan} sx={{ mb: 2 }}>Scan Devices</Button>

                {scannedDevices.length > 0 && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Device</InputLabel>
                        <Select value={selectedDevice} label="Select Device" onChange={handleDeviceSelect}>
                            {scannedDevices.map((device) => (
                                <MenuItem key={device.ip} value={device.ip}>
                                    {device.hostname} ({device.ip})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Component Name"
                        name="componentName"
                        value={formData.componentName}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="IP Address"
                        name="ip"
                        value={formData.ip}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="MAC Address"
                        name="mac"
                        value={formData.mac}
                        onChange={handleChange}
                        fullWidth
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        select
                        label="Type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="physical">Physical</MenuItem>
                        <MenuItem value="virtual">Virtual</MenuItem>
                    </TextField>

                    <TextField
                        label="Manufacturer"
                        name="manufacturer"
                        value={formData.manufacturer}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Serial Number"
                        name="serialNo"
                        value={formData.serialNo}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        select
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>

                    <TextField
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Latitude"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Longitude"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <Button type="submit" variant="contained">Add Device</Button>
                </form>
            </Paper>
        </MainLayout>
    );
};

export default AddDeviceForm;
