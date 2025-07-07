const axios = require('axios');
const fs = require('fs');
const path = require('path');

class NominatimService {
    constructor() {
        this.baseUrl = process.env.NOMINATIM_BASE_URL || 'https://nominatim.openstreetmap.org';
        this.userAgent = 'WiFi-Access-Point-Registry/1.0';
        this.conversionMapping = new Map();
        this.macVendorMapping = new Map();
        
        // Load conversion mappings from CSV
        this.loadConversionMappings();
        this.initializeMacVendorMapping();
    }

    loadConversionMappings() {
        try {
            const csvPath = path.join(__dirname, '../data/nominatim-to-80211u-conversion-table.csv');
            const csvContent = fs.readFileSync(csvPath, 'utf8');
            const lines = csvContent.split('\n');
            
            // Skip header line
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const [osmClass, osmType, mapping] = line.split(',');
                    if (osmClass && osmType && mapping) {
                        const key = `${osmClass.trim()},${osmType.trim()}`;
                        this.conversionMapping.set(key, mapping.trim());
                    }
                }
            }
            
            console.log(`Loaded ${this.conversionMapping.size} OSM to 802.11u mappings from CSV`);
        } catch (error) {
            console.error('Error loading conversion mappings from CSV:', error);
            // Fallback to basic mappings if CSV loading fails
            this.initializeFallbackMappings();
        }
    }

    initializeFallbackMappings() {
        // Basic fallback mappings if CSV loading fails
        const fallbackMappings = {
            'building,apartments': 'RESIDENTIAL - PRIVATE RESIDENCE',
            'building,house': 'RESIDENTIAL - PRIVATE RESIDENCE',
            'building,residential': 'RESIDENTIAL - PRIVATE RESIDENCE',
            'building,commercial': 'BUSINESS - UNSPECIFIED BUSINESS',
            'building,office': 'BUSINESS - PROFESSIONAL OFFICE',
            'building,retail': 'MERCANTILE - RETAIL STORE',
            'building,hotel': 'RESIDENTIAL - HOTEL OR MOTEL',
            'building,hospital': 'INSTITUTIONAL - HOSPITAL',
            'building,school': 'EDUCATIONAL - SCHOOL, PRIMARY',
            'building,university': 'EDUCATIONAL - UNIVERSITY OR COLLEGE',
            'amenity,restaurant': 'ASSEMBLY - RESTAURANT',
            'amenity,cafe': 'ASSEMBLY - COFFEE SHOP',
            'amenity,bar': 'ASSEMBLY - BAR',
            'amenity,bank': 'BUSINESS - BANK',
            'amenity,hospital': 'INSTITUTIONAL - HOSPITAL',
            'amenity,school': 'EDUCATIONAL - SCHOOL, PRIMARY',
            'amenity,university': 'EDUCATIONAL - UNIVERSITY OR COLLEGE',
            'amenity,fuel': 'MERCANTILE - GAS STATION',
            'amenity,parking': 'OUTDOOR - TRAFFIC CONTROL',
            'shop,supermarket': 'MERCANTILE - GROCERY MARKET',
            'shop,convenience': 'MERCANTILE - RETAIL STORE',
            'shop,mall': 'MERCANTILE - SHOPPING MALL',
            'office,company': 'BUSINESS - PROFESSIONAL OFFICE',
            'office,government': 'BUSINESS - PROFESSIONAL OFFICE',
            'leisure,park': 'OUTDOOR - CITY PARK',
            'tourism,hotel': 'RESIDENTIAL - HOTEL OR MOTEL'
        };

        for (const [key, value] of Object.entries(fallbackMappings)) {
            this.conversionMapping.set(key, value);
        }
    }

    initializeMacVendorMapping() {
        // MAC address vendor mapping based on wayfi-wireless mac-to-make.py
        const vendorMappings = {
            'Ubiquiti Inc': 'Ubiquiti',
            'Cisco Meraki': 'Meraki',
            'Edgecore Networks Corporation': 'EdgeCore',
            'Nova Labs': 'Helium',
            'GL Technologies (Hong Kong) Limited': 'OpenWRT',
            'Cambium Networks Limited': 'Cambium',
            'Ruckus Wireless': 'Ruckus',
            'Cisco Systems, Inc': 'Cisco / Meraki',
            'Helium Systems, Inc': 'Helium',
            'Juniper Networks': 'Juniper',
            'TP-Link Systems Inc': 'TP-Link',
            'TP-LINK TECHNOLOGIES CO.,LTD.': 'TP-Link',
            'Shenzhen Four Seas Global Link Network Technology Co., Ltd.': 'Wayru',
            'Belkin International Inc.': 'Belkin',
            'Routerboard.com': 'Mikrotik'
        };

        for (const [key, value] of Object.entries(vendorMappings)) {
            this.macVendorMapping.set(key, value);
        }
    }

    async searchAddress(query) {
        try {
            const response = await axios.get(`${this.baseUrl}/search`, {
                params: {
                    q: query,
                    format: 'json',
                    addressdetails: 1,
                    limit: 5
                },
                headers: {
                    'User-Agent': this.userAgent
                }
            });

            return response.data.map(result => ({
                display_name: result.display_name,
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                address: result.address,
                class: result.class,
                type: result.type,
                wifi_group: this.get802_11uGroup(result.class, result.type),
                wifi_type: this.get802_11uType(result.class, result.type)
            }));
        } catch (error) {
            console.error('Nominatim search error:', error);
            throw new Error('Failed to search address');
        }
    }

    async reverseGeocode(lat, lon) {
        try {
            const response = await axios.get(`${this.baseUrl}/reverse`, {
                params: {
                    lat: lat,
                    lon: lon,
                    format: 'json',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': this.userAgent
                }
            });

            const result = response.data;
            return {
                display_name: result.display_name,
                address: result.address,
                class: result.class,
                type: result.type,
                wifi_group: this.get802_11uGroup(result.class, result.type),
                wifi_type: this.get802_11uType(result.class, result.type)
            };
        } catch (error) {
            console.error('Nominatim reverse geocode error:', error);
            throw new Error('Failed to reverse geocode coordinates');
        }
    }

    get802_11uGroup(osmClass, osmType) {
        const key = `${osmClass},${osmType}`;
        const mapping = this.conversionMapping.get(key);
        
        if (mapping) {
            return mapping.split(' - ')[0];
        }
        
        // Fallback logic
        if (osmClass === 'building') return 'RESIDENTIAL';
        if (osmClass === 'amenity') return 'ASSEMBLY';
        if (osmClass === 'shop') return 'MERCANTILE';
        if (osmClass === 'office') return 'BUSINESS';
        if (osmClass === 'leisure') return 'OUTDOOR';
        if (osmClass === 'highway') return 'OUTDOOR';
        if (osmClass === 'tourism') return 'ASSEMBLY';
        if (osmClass === 'landuse') {
            if (osmType === 'residential') return 'RESIDENTIAL';
            if (osmType === 'commercial') return 'BUSINESS';
            if (osmType === 'industrial') return 'FACTORY-INDUSTRIAL';
        }
        
        return 'UTILITY-MISC';
    }

    get802_11uType(osmClass, osmType) {
        const key = `${osmClass},${osmType}`;
        const mapping = this.conversionMapping.get(key);
        
        if (mapping) {
            return mapping.split(' - ')[1] || 'UNSPECIFIED';
        }
        
        // Fallback logic
        if (osmClass === 'building') {
            if (osmType === 'residential' || osmType === 'apartments' || osmType === 'house') return 'PRIVATE RESIDENCE';
            if (osmType === 'commercial') return 'UNSPECIFIED BUSINESS';
            if (osmType === 'office') return 'PROFESSIONAL OFFICE';
            if (osmType === 'retail') return 'RETAIL STORE';
            if (osmType === 'hotel') return 'HOTEL OR MOTEL';
            if (osmType === 'hospital') return 'HOSPITAL';
            if (osmType === 'school') return 'SCHOOL, PRIMARY';
            if (osmType === 'university') return 'UNIVERSITY OR COLLEGE';
            return 'UNSPECIFIED RESIDENTIAL';
        }
        
        if (osmClass === 'amenity') {
            if (osmType === 'restaurant' || osmType === 'fast_food') return 'RESTAURANT';
            if (osmType === 'cafe') return 'COFFEE SHOP';
            if (osmType === 'bar' || osmType === 'pub') return 'BAR';
            if (osmType === 'bank') return 'BANK';
            if (osmType === 'hospital') return 'HOSPITAL';
            if (osmType === 'school') return 'SCHOOL, PRIMARY';
            if (osmType === 'university') return 'UNIVERSITY OR COLLEGE';
            if (osmType === 'library') return 'LIBRARY';
            if (osmType === 'theatre' || osmType === 'cinema') return 'THEATER';
            if (osmType === 'fuel') return 'GAS STATION';
            if (osmType === 'parking') return 'TRAFFIC CONTROL';
            if (osmType === 'place_of_worship') return 'PLACE OF WORSHIP';
            if (osmType === 'police') return 'POLICE STATION';
            if (osmType === 'post_office') return 'POST OFFICE';
            if (osmType === 'supermarket') return 'GROCERY MARKET';
            if (osmType === 'marketplace' || osmType === 'shopping') return 'SHOPPING MALL';
            return 'UNSPECIFIED ASSEMBLY';
        }
        
        if (osmClass === 'shop') {
            if (osmType === 'supermarket') return 'GROCERY MARKET';
            if (osmType === 'mall' || osmType === 'department_store') return 'SHOPPING MALL';
            if (osmType === 'car' || osmType === 'car_repair') return 'AUTOMOTIVE SERVICE STATION';
            if (osmType === 'fuel') return 'GAS STATION';
            return 'RETAIL STORE';
        }
        
        if (osmClass === 'office') {
            if (osmType === 'lawyer') return 'ATTORNEY OFFICE';
            if (osmType === 'financial') return 'BANK';
            return 'PROFESSIONAL OFFICE';
        }
        
        if (osmClass === 'leisure') {
            if (osmType === 'sports_centre') return 'ARENA';
            if (osmType === 'stadium') return 'STADIUM';
            return 'CITY PARK';
        }
        
        if (osmClass === 'tourism') {
            if (osmType === 'hotel' || osmType === 'motel') return 'HOTEL OR MOTEL';
            if (osmType === 'museum') return 'MUSEUM';
            if (osmType === 'attraction' || osmType === 'theme_park') return 'AMUSEMENT PARK';
            if (osmType === 'zoo') return 'ZOO OR AQUARIUM';
            if (osmType === 'aquarium') return 'ZOO OR AQUARIUM';
            return 'UNSPECIFIED ASSEMBLY';
        }
        
        if (osmClass === 'highway') {
            if (osmType === 'bus_stop') return 'BUS STOP';
            if (osmType === 'services') return 'REST AREA';
            return 'TRAFFIC CONTROL';
        }
        
        if (osmClass === 'landuse') {
            if (osmType === 'residential') return 'UNSPECIFIED RESIDENTIAL';
            if (osmType === 'commercial') return 'UNSPECIFIED BUSINESS';
            if (osmType === 'industrial') return 'UNSPECIFIED FACTORY AND INDUSTRIAL';
        }
        
        return 'UNSPECIFIED UTILITY AND MISCELLANEOUS';
    }

    async lookupMacVendor(macAddress) {
        try {
            // Clean MAC address
            const cleanMac = macAddress.replace(/[^0-9A-Fa-f]/g, '');
            if (cleanMac.length < 6) {
                return 'UNKNOWN';
            }

            // Get OUI (first 6 characters)
            const oui = cleanMac.substring(0, 6).toUpperCase();
            
            // Special cases for known prefixes
            if (oui.startsWith('B2') || oui.startsWith('B6')) {
                return 'Alta Labs';
            }

            // Use IEEE OUI lookup API
            const response = await axios.get(`https://api.macvendors.com/${oui}`, {
                timeout: 5000,
                headers: {
                    'User-Agent': this.userAgent
                }
            });

            const vendor = response.data.trim();
            return this.standardizeMacVendor(vendor);
        } catch (error) {
            console.error('MAC vendor lookup error:', error);
            return 'UNKNOWN';
        }
    }

    standardizeMacVendor(rawVendor) {
        if (!rawVendor || rawVendor === 'UNKNOWN') {
            return 'UNKNOWN';
        }

        // Check direct mapping
        const mapped = this.macVendorMapping.get(rawVendor);
        if (mapped) {
            return mapped;
        }

        // Fallback logic with keyword matching
        const lower = rawVendor.toLowerCase();
        
        if (lower.includes('ubiquiti')) return 'Ubiquiti';
        if (lower.includes('cisco') || lower.includes('meraki')) return 'Meraki';
        if (lower.includes('ruckus')) return 'Ruckus';
        if (lower.includes('juniper')) return 'Juniper';
        if (lower.includes('cambium')) return 'Cambium';
        if (lower.includes('helium') || lower.includes('nova labs')) return 'Helium';
        if (lower.includes('edgecore')) return 'EdgeCore';
        if (lower.includes('gl technologies') || lower.includes('openwrt')) return 'OpenWRT';
        if (lower.includes('alta labs')) return 'Alta Labs';
        if (lower.includes('wayru') || lower.includes('shenzhen four seas')) return 'Wayru';
        if (lower.includes('tp-link')) return 'TP-Link';
        if (lower.includes('belkin')) return 'Belkin';
        if (lower.includes('routerboard') || lower.includes('mikrotik')) return 'Mikrotik';

        return 'UNKNOWN';
    }

    // Get all available 802.11u mappings for debugging/reference
    getAllMappings() {
        const mappings = {};
        for (const [key, value] of this.conversionMapping.entries()) {
            mappings[key] = value;
        }
        return mappings;
    }

    // Get mapping statistics
    getMappingStats() {
        return {
            totalMappings: this.conversionMapping.size,
            macVendorMappings: this.macVendorMapping.size
        };
    }
}

module.exports = new NominatimService();
