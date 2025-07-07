# Quick Start Guide

## WiFi Access Point Registry

This guide will help you get the WiFi Access Point Registry up and running quickly.

## Prerequisites

Choose one of the following options:

### Option A: Docker (Recommended)
- Docker Desktop or Docker Engine
- Docker Compose

### Option B: Local Development
- Node.js (v14 or higher)
- npm

## Getting Started

### With Docker (Recommended)

1. **Navigate to the project directory**
   ```bash
   cd wifi-access-point-registry
   ```

2. **Start the application**
   ```bash
   # With SQLite (lightweight, good for testing)
   docker-compose up -d
   
   # OR with PostgreSQL (production-ready)
   docker-compose --profile postgres up -d
   ```

3. **Access the application**
   - SQLite version: http://localhost:3000
   - PostgreSQL version: http://localhost:3001

4. **View logs (optional)**
   ```bash
   docker-compose logs -f wifi-registry
   ```

### With Local Development

1. **Navigate to the backend directory**
   ```bash
   cd wifi-access-point-registry/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open http://localhost:3000 in your browser

## Using the Application

### Register a New Access Point

1. Click on the "Register Access Point" tab
2. Fill in the required information:
   - **NASID**: Network Access Server ID (MAC address format)
   - **Location Name**: Descriptive name for the location
   - **SSID**: WiFi network name
   - **Address**: Use the search box to find and select an address
   - **Map**: Click on the map to set precise coordinates
   - **WiFi Configuration**: Select 802.11u group and type
   - **Hardware**: Enter access point make and model
   - **Network**: Set upload/download speeds and ISP
   - **Traffic**: Estimate foot traffic level

3. Click "Register Access Point" to save

### View Registered Access Points

1. Click on the "View Access Points" tab
2. Use the search box to find specific access points
3. Filter by WiFi group using the dropdown
4. Navigate through pages using pagination controls

## Sample Data

Here's an example of the data format expected:

```
NASID: 00:25:9c:cf:1c:ac
Location Name: Central Park Wi-Fi Zone
Street Address: East 72nd St
City: New York
State: NY
ZIP: 10021
Country: United States
WiFi Group: OUTDOOR
WiFi Type: CITY PARK
AP Make: Cisco
AP Model: Aironet 2800
Upload Speed: 25 Mbps
Download Speed: 100 Mbps
ISP: Spectrum
SSID: CentralParkFreeWiFi
Foot Traffic: High
```

## API Testing

You can test the API endpoints directly:

### Health Check
```bash
curl http://localhost:3000/api/health
```

### List Access Points
```bash
curl http://localhost:3000/api/access-points
```

### Create Access Point
```bash
curl -X POST http://localhost:3000/api/access-points \
  -H "Content-Type: application/json" \
  -d '{
    "nasid": "00:25:9c:cf:1c:ac",
    "location_name": "Test Location",
    "street_address": "123 Test St",
    "city": "Test City",
    "zip_code": "12345",
    "country": "United States",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "wifi_group": "OUTDOOR",
    "wifi_type_categorization": "CITY PARK",
    "ap_make": "Cisco",
    "ap_model": "Test Model",
    "estimated_upload_speed": 25,
    "estimated_download_speed": 100,
    "isp": "Test ISP",
    "ssid": "TestWiFi",
    "foot_traffic_estimates": "Medium"
  }'
```

## Troubleshooting

### Docker Issues
- Ensure Docker is running: `docker --version`
- Check container status: `docker-compose ps`
- View logs: `docker-compose logs wifi-registry`
- Restart services: `docker-compose restart`

### Local Development Issues
- Check Node.js version: `node --version`
- Verify database initialization: Check if `database/registry.db` exists
- Check server logs for error messages

### Common Problems

1. **Port already in use**
   - Change the port in docker-compose.yml or .env file
   - Or stop the service using the port

2. **Database connection errors**
   - Ensure database is initialized
   - Check file permissions for SQLite database

3. **Map not loading**
   - Check internet connection for map tiles
   - Verify no browser console errors

4. **Address search not working**
   - Check internet connection for Nominatim API
   - Verify API rate limits aren't exceeded

## Next Steps

- Customize the 802.11u groups and types for your use case
- Add authentication if needed for production use
- Set up monitoring and logging for production deployment
- Consider adding data export/import functionality
- Implement backup strategies for the database

## Support

For issues or questions:
1. Check the main README.md for detailed documentation
2. Review the troubleshooting section
3. Check Docker/Node.js installation guides
4. Verify all prerequisites are met
