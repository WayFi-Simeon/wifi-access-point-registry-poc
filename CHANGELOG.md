# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-07

### Added
- Initial release of WiFi Access Point Registry
- Complete registration form with all required fields from specification
- Smart address autocomplete using Nominatim API
- Interactive Leaflet.js map for precise coordinate selection
- Automatic 802.11u venue classification based on location type
- Comprehensive OSM to 802.11u mapping table (400+ mappings)
- Flexible database support (SQLite and PostgreSQL)
- Docker containerization for easy deployment
- RESTful API with full CRUD operations
- Responsive web interface
- Data validation (client and server-side)
- Search and filter functionality for access points
- Pagination support for large datasets
- Health check endpoints
- Sample data for testing

### Features
- **Location Management**
  - Real-time address search and autocomplete
  - Interactive map with click-to-place functionality
  - Automatic coordinate generation (no manual input)
  - Reverse geocoding support

- **802.11u Classification**
  - Automatic venue group detection (OUTDOOR, MERCANTILE, etc.)
  - Automatic venue type categorization (CITY PARK, RETAIL STORE, etc.)
  - Standards-compliant mapping based on OpenStreetMap data

- **Access Point Management**
  - Complete registration form with all specification fields
  - NASID, SSID, BSSID support
  - Hardware information (Make, Model)
  - Network specifications (Upload/Download speeds, ISP)
  - Traffic estimates and venue information

- **Technical Features**
  - Docker deployment with one-command setup
  - Database flexibility (SQLite for development, PostgreSQL for production)
  - Environment-based configuration
  - Comprehensive error handling
  - API documentation
  - Responsive design for mobile and desktop

### Technical Stack
- **Backend**: Node.js, Express.js
- **Database**: SQLite (default), PostgreSQL (production)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Geocoding**: Nominatim API
- **Deployment**: Docker, Docker Compose
- **Validation**: Joi (server-side), HTML5 (client-side)

### Documentation
- Comprehensive README with setup instructions
- Quick start guide for immediate deployment
- Docker troubleshooting guide
- API endpoint documentation
- Architecture overview
- Development setup instructions
- Production deployment guide

### Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Environment variable management

### Performance
- Debounced search to reduce API calls
- Efficient database queries with pagination
- Optimized Docker images
- Caching for static assets
- Responsive design for fast loading

## [Unreleased]

### Planned Features
- User authentication and authorization
- Bulk import/export functionality
- Advanced filtering and search options
- Real-time updates with WebSockets
- Analytics dashboard
- API rate limiting
- Enhanced mobile experience
- Multi-language support
- Advanced mapping features (clustering, heatmaps)
- Integration with external WiFi databases
