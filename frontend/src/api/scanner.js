import axios from 'axios';

const API = axios.create({
    baseURL: "http://localhost:5000/api/scanner"
});

export const scanDevices = async (cidr) => {
    try {
        const response = await API.post("/alldevices", { cidr: cidr });
        return response.data;
    } catch (error) {
        console.error("Error scanning devices:", error);
        throw error;
    }
};

export const getDeviceInfo = async (ip) => {
    try {
        const response = await API.post("/device", { ip: ip });
        return response.data;
    } catch (error) {
        console.error("Error getting device info:", error);
        throw error;
    }
};

// scanDevices("192.168.1.0/24").then(data => console.log(data)).catch(err => console.error(err));
