-- WiFi Access Point Registry Database Schema
-- Supports both SQLite and PostgreSQL

CREATE TABLE IF NOT EXISTS access_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nasid VARCHAR(255) NOT NULL UNIQUE,
    location_name VARCHAR(255) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    wifi_group VARCHAR(100) NOT NULL,
    wifi_type_categorization VARCHAR(100) NOT NULL,
    ap_make VARCHAR(100) NOT NULL,
    ap_model VARCHAR(100) NOT NULL,
    estimated_upload_speed INTEGER NOT NULL,
    estimated_download_speed INTEGER NOT NULL,
    isp VARCHAR(100) NOT NULL,
    venue_type VARCHAR(100),
    ssid VARCHAR(255) NOT NULL,
    bssid VARCHAR(17),
    venue_name_alt VARCHAR(255),
    foot_traffic_estimates VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_access_points_nasid ON access_points(nasid);
CREATE INDEX IF NOT EXISTS idx_access_points_location ON access_points(city, state, country);
CREATE INDEX IF NOT EXISTS idx_access_points_coordinates ON access_points(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_access_points_wifi_group ON access_points(wifi_group);
CREATE INDEX IF NOT EXISTS idx_access_points_ap_make ON access_points(ap_make);

-- Create a view for common queries
CREATE VIEW IF NOT EXISTS access_points_summary AS
SELECT 
    id,
    nasid,
    location_name,
    CONCAT(street_address, ', ', city, ', ', state, ' ', zip_code) as full_address,
    latitude,
    longitude,
    wifi_group,
    wifi_type_categorization,
    ap_make,
    ap_model,
    estimated_download_speed,
    isp,
    ssid,
    created_at
FROM access_points;
