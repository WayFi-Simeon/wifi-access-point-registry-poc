# WiFi Access Point Registry

A comprehensive web application for registering and managing WiFi access points with intelligent location mapping and automatic 802.11u classification.

<img width="899" alt="image" src="https://github.com/user-attachments/assets/d7438e07-bbf4-4c93-9fc7-997c14ec13db" />
<img width="858" alt="image" src="https://github.com/user-attachments/assets/1d2eb8f3-bd8d-4743-a62e-59a91b93d980" />
<img width="871" alt="image" src="https://github.com/user-attachments/assets/4d3a35f0-0c3e-4db7-80a1-87b3fd01bc36" />
<img width="899" alt="image" src="https://github.com/user-attachments/assets/9f007174-cae2-40f7-9f82-dcbdb2cc8086" />


## 🌟 Features

### 🗺️ Smart Location Management
- **Address Autocomplete**: Real-time address suggestions using Nominatim API
- **Interactive Map**: Leaflet.js integration for precise coordinate selection
- **Automatic Geocoding**: Converts addresses to coordinates automatically
- **No Manual Coordinates**: Users cannot input coordinates directly for data integrity

### 🏷️ Intelligent 802.11u Classification
- **Automatic Detection**: Maps OpenStreetMap location types to 802.11u standards
- **Comprehensive Mapping**: 400+ location type mappings included
- **Standards Compliant**: Follows official 802.11u venue categorization
- **Real-time Updates**: Classifications update as locations are selected

### 📋 Complete Access Point Management
- **Full Registration Form**: All required fields for WiFi access point data
- **Data Validation**: Client and server-side validation
- **Search & Filter**: Find access points by location, type, or other criteria
- **Responsive Design**: Works on desktop and mobile devices

### 🗄️ Flexible Database Support
- **SQLite**: Default lightweight database for development/testing
- **PostgreSQL**: Production-ready database option
- **Easy Migration**: Switch between databases with configuration

### 🐳 Docker Deployment
- **One-Command Setup**: Complete Docker containerization
- **Development Ready**: Quick start for local development
- **Production Ready**: Scalable deployment configuration

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wifi-access-point-registry
   ```

2. **Start the application**
   ```bash
   ./run-docker.sh
   ```

3. **Choose database option**
   - Option 1: SQLite (recommended for development)
   - Option 2: PostgreSQL (recommended for production)

4. **Access the application**
   - Open http://localhost:3000 in your browser

That's it! The application will be running with sample data.

## 📖 Usage

### Registering an Access Point

1. **Navigate to Registration Tab**
   - Click "Register Access Point" tab

2. **Search for Location**
   - Type an address in the "Search Address" field
   - Select from the dropdown suggestions
   - The map will automatically center on the location

3. **Fine-tune Location**
   - Click on the map to adjust the exact position
   - Coordinates will update automatically

4. **Complete the Form**
   - Fill in access point details (NASID, SSID, hardware info)
   - Network information (speeds, ISP, traffic estimates)
   - 802.11u fields are auto-populated based on location

5. **Submit**
   - Click "Register Access Point" to save

### Viewing Access Points

1. **Navigate to List Tab**
   - Click "View Access Points" tab

2. **Search and Filter**
   - Use the search box to find specific access points
   - Filter by 802.11u group type
   - Navigate through pages if you have many entries

## 🏗️ Architecture

### Backend (Node.js/Express)
```
backend/
├── server.js              # Main server file
├── config/
│   └── database.js        # Database configuration
├── routes/
│   ├── accessPoints.js    # Access point CRUD operations
│   └── geocoding.js       # Address geocoding endpoints
├── services/
│   └── nominatimService.js # Nominatim API integration
├── validators/
│   └── accessPoint.js     # Data validation
├── scripts/
│   └── init-database.js   # Database initialization
└── data/
    └── nominatim-to-80211u-conversion-table.csv
```

### Frontend (Vanilla JavaScript)
```
frontend/
├── index.html             # Main HTML structure
├── styles.css             # Responsive CSS styling
└── script.js              # Application logic
```

### Database
```
database/
└── schema.sql             # Database schema definition
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
DB_TYPE=sqlite              # sqlite or postgresql
DB_HOST=localhost           # PostgreSQL host
DB_PORT=5432               # PostgreSQL port
DB_NAME=wifi_registry      # Database name
DB_USER=postgres           # PostgreSQL username
DB_PASSWORD=password       # PostgreSQL password

# Server Configuration
PORT=3000                  # Server port
NODE_ENV=development       # development or production

# External APIs
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
```

### Database Schema

The application supports all fields from your specification:

**Required Fields:**
- NASID, Location Name, Street Address, City, ZIP, Country
- Latitude, Longitude (auto-generated)
- 802.11u Group, 802.11u Type (auto-detected)
- AP Make, AP Model
- Upload/Download Speeds, ISP
- SSID, Foot Traffic Estimates

**Optional Fields:**
- BSSID, State/Province, Venue Type, Alternative Venue Name

## 🛠️ Development

### Local Development Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database**
   ```bash
   npm run init-db
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Docker Development

```bash
# Build and start
./rebuild-docker.sh

# View logs
docker-compose logs -f wifi-registry

# Stop
docker-compose down
```

## 📊 API Endpoints

### Access Points
- `GET /api/access-points` - List access points (with pagination/filtering)
- `POST /api/access-points` - Create new access point
- `GET /api/access-points/:id` - Get specific access point
- `PUT /api/access-points/:id` - Update access point
- `DELETE /api/access-points/:id` - Delete access point

### Geocoding
- `POST /api/access-points/geocode` - Search addresses
- `POST /api/access-points/reverse-geocode` - Reverse geocode coordinates

### Health Check
- `GET /api/health` - Application health status

## 🗺️ 802.11u Mapping

The application includes a comprehensive mapping table that converts OpenStreetMap location types to 802.11u venue categories:

**Supported Groups:**
- OUTDOOR (parks, traffic control, etc.)
- MERCANTILE (retail, shopping, gas stations)
- RESIDENTIAL (homes, hotels, motels)
- EDUCATIONAL (schools, universities)
- HEALTHCARE (hospitals, clinics)
- And many more...

**Example Mappings:**
- `leisure,park` → `OUTDOOR - CITY PARK`
- `shop,supermarket` → `MERCANTILE - GROCERY MARKET`
- `amenity,restaurant` → `ASSEMBLY - RESTAURANT`
- `building,hotel` → `RESIDENTIAL - HOTEL OR MOTEL`

## 🚀 Deployment

### Production Deployment

1. **Set up environment**
   ```bash
   cp backend/.env.example backend/.env
   # Configure for production
   ```

2. **Use PostgreSQL**
   ```bash
   ./run-docker.sh
   # Choose option 2 for PostgreSQL
   ```

3. **Configure reverse proxy** (nginx example)
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Scaling Considerations

- Use PostgreSQL for production databases
- Consider Redis for session storage
- Implement rate limiting for geocoding API
- Add monitoring and logging
- Use environment-specific configurations

## 🔒 Security

This application implements comprehensive security measures including:

- **No hardcoded credentials**: All sensitive data uses environment variables
- **SQL injection prevention**: Parameterized database queries
- **Input validation**: Server-side validation and sanitization
- **XSS protection**: Proper output escaping
- **CORS configuration**: Configurable cross-origin policies

For detailed security information, deployment guidelines, and best practices, see [SECURITY.md](SECURITY.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap** for geocoding services
- **Leaflet.js** for mapping functionality
- **Nominatim** for address search
- **802.11u Standard** for venue categorization

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for the WiFi community**
