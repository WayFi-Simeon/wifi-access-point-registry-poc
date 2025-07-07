const express = require('express');
const router = express.Router();
const nominatimService = require('../services/nominatimService');

// Search addresses with 802.11u categorization
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const results = await nominatimService.searchAddress(q);
        res.json(results);
    } catch (error) {
        console.error('Address search error:', error);
        res.status(500).json({ error: 'Failed to search address' });
    }
});

// Reverse geocode coordinates with 802.11u categorization
router.get('/reverse', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Parameters "lat" and "lon" are required' });
        }

        const result = await nominatimService.reverseGeocode(parseFloat(lat), parseFloat(lon));
        res.json(result);
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        res.status(500).json({ error: 'Failed to reverse geocode coordinates' });
    }
});

// Lookup MAC address vendor
router.get('/mac-vendor', async (req, res) => {
    try {
        const { mac } = req.query;
        
        if (!mac) {
            return res.status(400).json({ error: 'Query parameter "mac" is required' });
        }

        const vendor = await nominatimService.lookupMacVendor(mac);
        res.json({ mac, vendor });
    } catch (error) {
        console.error('MAC vendor lookup error:', error);
        res.status(500).json({ error: 'Failed to lookup MAC vendor' });
    }
});

module.exports = router;
