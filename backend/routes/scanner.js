import express from 'express';
import { scanNetwork } from "../scanner.js";

const router = express.Router();

router.post('/alldevices', async (req, res) => {
    const { cidr } = req.body;
    if (!cidr) {
        return res.status(400).json({ error: 'CIDR is required' });
    }
    try {
        const result = await scanNetwork(cidr);
        res.json(result);
    } catch (error) {
        console.error('Error scanning network:', error);
        res.status(500).json({ error: 'Failed to scan network' });
    }
});

router.post('/device', async (req, res) => {
    const { ip } = req.body;
    if (!ip) {
        return res.status(400).json({ error: 'IP address is required' });
    }
    try {
        const result = await getDeviceInfo(ip);
        res.json(result);
    } catch (error) {
        console.error('Error getting device info:', error);
        res.status(500).json({ error: 'Failed to get device info' });
    }
});

export default router;
