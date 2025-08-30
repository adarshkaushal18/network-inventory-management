import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import deviceRoutes from "./routes/device.js";
import scannerRoutes from "./routes/scanner.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.error('MongoDB connection error:', error));
}

app.get('/api', (req, res) => {
    res.send('API is working');
});

app.use('/api/device', deviceRoutes);
app.use('/api/scanner', scannerRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
