const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const dbPath = path.join(__dirname, '../database/registry.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Read schema file
const schema = fs.readFileSync(schemaPath, 'utf8');

// Initialize SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

// Execute schema
db.exec(schema, (err) => {
    if (err) {
        console.error('Error creating schema:', err.message);
        process.exit(1);
    }
    console.log('Database schema created successfully.');
    
    // Insert sample data
    const sampleData = `
        INSERT OR IGNORE INTO access_points (
            nasid, location_name, street_address, city, state, zip_code, country,
            latitude, longitude, wifi_group, wifi_type_categorization, ap_make, ap_model,
            estimated_upload_speed, estimated_download_speed, isp, venue_type, ssid, bssid,
            venue_name_alt, foot_traffic_estimates
        ) VALUES 
        ('00259ccf1cac', 'Central Park Wi-Fi Zone', 'East 72nd St', 'New York', 'NY', '10021', 'United States',
         40.7725, -73.9676, 'OUTDOOR', 'CITY PARK', 'Cisco', 'Aironet 2800',
         25, 100, 'Spectrum', 'Outdoor', 'CentralParkFreeWiFi', '00:25:9c:cf:1c:ac',
         'Central Park', 'High'),
        ('001a1e2b3c4d', 'Union Square Plaza Wi-Fi', '333 Post St', 'San Francisco', 'CA', '94108', 'United States',
         37.7881, -122.4075, 'MERCANTILE', 'SHOPPING MALL', 'Aruba', 'AP-515',
         20, 75, 'Xfinity', 'Outdoor', 'UnionSquareWiFi', '00:1a:1e:2b:3c:4d',
         'Union Square', 'Medium'),
        ('442a60adccee', 'Oxford Street Wi-Fi', '218 Oxford St', 'London', '', 'W1D 1LP', 'United Kingdom',
         51.5154, -0.1411, 'MERCANTILE', 'RETAIL STORE', 'Cisco', 'Meraki MR36',
         15, 50, 'BT', 'Indoor', 'OxfordStreetWiFi', '44:2a:60:ad:cc:ee',
         'Oxford Street', 'High');
    `;
    
    db.exec(sampleData, (err) => {
        if (err) {
            console.error('Error inserting sample data:', err.message);
        } else {
            console.log('Sample data inserted successfully.');
        }
        
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    });
});
