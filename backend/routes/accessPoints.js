const express = require('express');
const axios = require('axios');
const db = require('../config/database');
const { accessPointSchema, updateAccessPointSchema, geocodeSchema } = require('../validators/accessPoint');

const router = express.Router();

// Get all access points
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search, wifi_group, country } = req.query;
        const offset = (page - 1) * limit;
        
        let sql = 'SELECT * FROM access_points WHERE 1=1';
        let params = [];
        let paramIndex = 1;
        
        if (search) {
            sql += ` AND (location_name LIKE ?${paramIndex} OR city LIKE ?${paramIndex + 1} OR ssid LIKE ?${paramIndex + 2})`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            paramIndex += 3;
        }
        
        if (wifi_group) {
            sql += ` AND wifi_group = ?${paramIndex}`;
            params.push(wifi_group);
            paramIndex++;
        }
        
        if (country) {
            sql += ` AND country = ?${paramIndex}`;
            params.push(country);
            paramIndex++;
        }
        
        sql += ` ORDER BY created_at DESC LIMIT ?${paramIndex} OFFSET ?${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const accessPoints = await db.query(sql, params);
        
        // Get total count for pagination
        let countSql = 'SELECT COUNT(*) as total FROM access_points WHERE 1=1';
        let countParams = [];
        let countParamIndex = 1;
        
        if (search) {
            countSql += ` AND (location_name LIKE ?${countParamIndex} OR city LIKE ?${countParamIndex + 1} OR ssid LIKE ?${countParamIndex + 2})`;
            countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
            countParamIndex += 3;
        }
        
        if (wifi_group) {
            countSql += ` AND wifi_group = ?${countParamIndex}`;
            countParams.push(wifi_group);
            countParamIndex++;
        }
        
        if (country) {
            countSql += ` AND country = ?${countParamIndex}`;
            countParams.push(country);
        }
        
        const countResult = await db.query(countSql, countParams);
        const total = countResult[0].total;
        
        res.json({
            data: accessPoints,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching access points:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single access point by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const accessPoint = await db.query('SELECT * FROM access_points WHERE id = ?', [id]);
        
        if (accessPoint.length === 0) {
            return res.status(404).json({ error: 'Access point not found' });
        }
        
        res.json(accessPoint[0]);
    } catch (error) {
        console.error('Error fetching access point:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new access point
router.post('/', async (req, res) => {
    try {
        const { error, value } = accessPointSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: error.details.map(d => d.message) 
            });
        }
        
        // Check if NASID already exists
        const existing = await db.query('SELECT id FROM access_points WHERE nasid = ?', [value.nasid]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Access point with this NASID already exists' });
        }
        
        const sql = `
            INSERT INTO access_points (
                nasid, location_name, street_address, city, state, zip_code, country,
                latitude, longitude, wifi_group, wifi_type_categorization, ap_make, ap_model,
                estimated_upload_speed, estimated_download_speed, isp, venue_type, ssid, bssid,
                venue_name_alt, foot_traffic_estimates
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            value.nasid, value.location_name, value.street_address, value.city, value.state,
            value.zip_code, value.country, value.latitude, value.longitude, value.wifi_group,
            value.wifi_type_categorization, value.ap_make, value.ap_model, value.estimated_upload_speed,
            value.estimated_download_speed, value.isp, value.venue_type, value.ssid, value.bssid,
            value.venue_name_alt, value.foot_traffic_estimates
        ];
        
        const result = await db.insert(sql, params);
        
        res.status(201).json({ 
            message: 'Access point created successfully', 
            id: result.id 
        });
    } catch (error) {
        console.error('Error creating access point:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update access point
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateAccessPointSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: error.details.map(d => d.message) 
            });
        }
        
        // Check if access point exists
        const existing = await db.query('SELECT id FROM access_points WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Access point not found' });
        }
        
        // Build dynamic update query
        const updateFields = Object.keys(value);
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        const setClause = updateFields.map(field => `${field} = ?`).join(', ');
        const sql = `UPDATE access_points SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const params = [...Object.values(value), id];
        
        const result = await db.run(sql, params);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Access point not found' });
        }
        
        res.json({ message: 'Access point updated successfully' });
    } catch (error) {
        console.error('Error updating access point:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete access point
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.run('DELETE FROM access_points WHERE id = ?', [id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Access point not found' });
        }
        
        res.json({ message: 'Access point deleted successfully' });
    } catch (error) {
        console.error('Error deleting access point:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Geocode address using Nominatim API with 802.11u auto-detection
router.post('/geocode', async (req, res) => {
    try {
        const { error, value } = geocodeSchema.validate(req.body);
        
        if (error) {
            return res.status(400).json({ 
                error: 'Validation error', 
                details: error.details.map(d => d.message) 
            });
        }
        
        const nominatimService = require('../services/nominatimService');
        const results = await nominatimService.searchAddress(value.address);
        
        res.json(results);
    } catch (error) {
        console.error('Error geocoding address:', error);
        res.status(500).json({ error: 'Failed to search address' });
    }
});

module.exports = router;
