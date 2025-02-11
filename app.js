const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const axios = require('axios');
const app = express();
const db = require('./db/db'); // Ensure the database connection is properly configured
const Track = require('./models/track');

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'https://faaizmahmood.me'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}))

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleString()} - Request made at: ${req.originalUrl}`);
    next();
});

app.set('trust proxy', true);

const visitorCountFile = path.join(__dirname, 'visitor-count.json');

// Function to update visitor count in the file
async function updateVisitorCount() {
    try {
        let countData = { visitorCount: 0 };

        // Read existing count if file exists
        try {
            const fileData = await fs.readFile(visitorCountFile, 'utf-8');
            countData = JSON.parse(fileData);
        } catch (err) {
            console.warn('Visitor count file not found, creating a new one.');
        }

        // Increment the visitor count
        countData.visitorCount += 1;

        // Write updated count back to the file
        await fs.writeFile(visitorCountFile, JSON.stringify(countData, null, 2));
        console.log(`Visitor count updated: ${countData.visitorCount}`);

    } catch (err) {
        console.error('Error updating visitor count:', err);
    }
}

app.post('/api/track', async (req, res) => {
    const data = req.body;
    let clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    // Fallback for local testing
    clientIp = clientIp === '::1' ? '8.8.8.8' : clientIp;

    if (!data || !data.timestamp) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    let locationInfo = {};
    try {
        const response = await axios.get(`https://ipinfo.io/${clientIp}/json`);
        locationInfo = response.data;
    } catch (error) {
        console.warn('Error fetching location data:', error.message);
    }

    data.ip = clientIp;
    data.locationInfo = locationInfo;

    try {
        const track = new Track(data); // Ensure new instance creation
        await track.save(); // Proper save with await
        await updateVisitorCount(); // Update visitor count
        res.status(201).json({ message: 'Tracking data saved successfully' });
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
