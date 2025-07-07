// Global variables
let map;
let marker;
let currentPage = 1;
let currentFilters = {};

// API base URL
const API_BASE = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    setupEventListeners();
    loadAccessPoints();
});

// Initialize Leaflet map
function initializeMap() {
    map = L.map('map').setView([40.7128, -74.0060], 10); // Default to NYC
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add click event to map
    map.on('click', function(e) {
        setMapMarker(e.latlng.lat, e.latlng.lng);
    });
}

// Set marker on map and update coordinate fields
function setMapMarker(lat, lng) {
    if (marker) {
        map.removeLayer(marker);
    }
    
    marker = L.marker([lat, lng]).addTo(map);
    
    // Update coordinate inputs
    document.getElementById('latitude').value = lat.toFixed(8);
    document.getElementById('longitude').value = lng.toFixed(8);
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('access-point-form').addEventListener('submit', handleFormSubmit);
    
    // Address search
    document.getElementById('search-btn').addEventListener('click', searchAddress);
    document.getElementById('address-search').addEventListener('input', debounce(searchAddress, 500));
    
    // List controls
    document.getElementById('search-input').addEventListener('input', debounce(filterAccessPoints, 500));
    document.getElementById('filter-group').addEventListener('change', filterAccessPoints);
    document.getElementById('refresh-list').addEventListener('click', () => loadAccessPoints());
    
    // Form reset
    document.getElementById('access-point-form').addEventListener('reset', function() {
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
        clearAddressSuggestions();
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        const searchContainer = document.querySelector('.address-search-container');
        const suggestionsContainer = document.getElementById('address-suggestions');
        
        if (searchContainer && !searchContainer.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            clearAddressSuggestions();
        }
    });
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    data.latitude = parseFloat(data.latitude);
    data.longitude = parseFloat(data.longitude);
    data.estimated_upload_speed = parseInt(data.estimated_upload_speed);
    data.estimated_download_speed = parseInt(data.estimated_download_speed);
    
    // Remove empty optional fields
    Object.keys(data).forEach(key => {
        if (data[key] === '' && !isRequiredField(key)) {
            delete data[key];
        }
    });
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/access-points`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Access point registered successfully!', 'success');
            e.target.reset();
            if (marker) {
                map.removeLayer(marker);
                marker = null;
            }
            clearAddressSuggestions();
            
            // Switch to list tab and refresh
            showTab('list');
            loadAccessPoints();
        } else {
            showNotification(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Error registering access point:', error);
        showNotification('Network error occurred', 'error');
    } finally {
        showLoading(false);
    }
}

// Search address using Nominatim API
async function searchAddress() {
    const query = document.getElementById('address-search').value.trim();
    
    if (query.length < 3) {
        clearAddressSuggestions();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/access-points/geocode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address: query, limit: 5 })
        });
        
        const results = await response.json();
        
        if (response.ok) {
            displayAddressSuggestions(results);
        } else {
            console.error('Geocoding error:', results.error);
        }
    } catch (error) {
        console.error('Error searching address:', error);
    }
}

// Display address suggestions
function displayAddressSuggestions(results) {
    const container = document.getElementById('address-suggestions');
    container.innerHTML = '';
    
    if (results.length === 0) {
        container.classList.remove('show');
        return;
    }
    
    results.forEach(result => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = result.display_name;
        
        item.addEventListener('click', () => {
            selectAddress(result);
        });
        
        container.appendChild(item);
    });
    
    container.classList.add('show');
}

// Select an address from suggestions
function selectAddress(result) {
    // Fill form fields
    document.getElementById('street_address').value = 
        `${result.address.house_number || ''} ${result.address.road || ''}`.trim();
    document.getElementById('city').value = result.address.city || result.address.town || result.address.village || '';
    document.getElementById('state').value = result.address.state || result.address.province || '';
    document.getElementById('zip_code').value = result.address.postcode || '';
    document.getElementById('country').value = result.address.country || '';
    
    // Fill auto-detected 802.11u fields (use correct field IDs from HTML)
    document.getElementById('wifi-group').value = result.wifi_group || '';
    document.getElementById('wifi-type').value = result.wifi_type || '';
    
    // Set map location and coordinates
    map.setView([result.lat, result.lon], 15);
    setMapMarker(result.lat, result.lon);
    
    // Clear suggestions and update search field
    clearAddressSuggestions();
    document.getElementById('address-search').value = result.display_name;
}

// Clear address suggestions
function clearAddressSuggestions() {
    const container = document.getElementById('address-suggestions');
    container.innerHTML = '';
    container.classList.remove('show');
}

// Load access points list
async function loadAccessPoints(page = 1) {
    try {
        const params = new URLSearchParams({
            page: page,
            limit: 12,
            ...currentFilters
        });
        
        const response = await fetch(`${API_BASE}/access-points?${params}`);
        const result = await response.json();
        
        if (response.ok) {
            displayAccessPoints(result.data);
            displayPagination(result.pagination);
            currentPage = page;
        } else {
            showNotification('Failed to load access points', 'error');
        }
    } catch (error) {
        console.error('Error loading access points:', error);
        showNotification('Network error occurred', 'error');
    }
}

// Display access points in grid
function displayAccessPoints(accessPoints) {
    const container = document.getElementById('access-points-list');
    
    if (accessPoints.length === 0) {
        container.innerHTML = '<p>No access points found.</p>';
        return;
    }
    
    container.innerHTML = accessPoints.map(ap => `
        <div class="access-point-card">
            <h3>${escapeHtml(ap.location_name)}</h3>
            <div class="nasid">${escapeHtml(ap.nasid)}</div>
            <div class="location">
                ${escapeHtml(ap.street_address)}, ${escapeHtml(ap.city)}, ${escapeHtml(ap.state)} ${escapeHtml(ap.zip_code)}
            </div>
            <div class="details">
                <div class="detail-item">
                    <span class="detail-label">SSID:</span>
                    <span>${escapeHtml(ap.ssid)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Group:</span>
                    <span>${escapeHtml(ap.wifi_group)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Type:</span>
                    <span>${escapeHtml(ap.wifi_type_categorization)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">AP Make:</span>
                    <span>${escapeHtml(ap.ap_make)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">AP Model:</span>
                    <span>${escapeHtml(ap.ap_model)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Download:</span>
                    <span>${ap.estimated_download_speed} Mbps</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Upload:</span>
                    <span>${ap.estimated_upload_speed} Mbps</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ISP:</span>
                    <span>${escapeHtml(ap.isp)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Traffic:</span>
                    <span>${escapeHtml(ap.foot_traffic_estimates)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Display pagination controls
function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    
    if (pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button ${pagination.page === 1 ? 'disabled' : ''} 
             onclick="loadAccessPoints(${pagination.page - 1})">Previous</button>`;
    
    // Page numbers
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);
    
    if (startPage > 1) {
        html += `<button onclick="loadAccessPoints(1)">1</button>`;
        if (startPage > 2) {
            html += `<span>...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button ${i === pagination.page ? 'class="active"' : ''} 
                 onclick="loadAccessPoints(${i})">${i}</button>`;
    }
    
    if (endPage < pagination.pages) {
        if (endPage < pagination.pages - 1) {
            html += `<span>...</span>`;
        }
        html += `<button onclick="loadAccessPoints(${pagination.pages})">${pagination.pages}</button>`;
    }
    
    // Next button
    html += `<button ${pagination.page === pagination.pages ? 'disabled' : ''} 
             onclick="loadAccessPoints(${pagination.page + 1})">Next</button>`;
    
    container.innerHTML = html;
}

// Filter access points
function filterAccessPoints() {
    const search = document.getElementById('search-input').value.trim();
    const group = document.getElementById('filter-group').value;
    
    currentFilters = {};
    if (search) currentFilters.search = search;
    if (group) currentFilters.wifi_group = group;
    
    loadAccessPoints(1);
}

// Tab switching
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to selected tab button
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    
    // Load data if switching to list tab
    if (tabName === 'list') {
        loadAccessPoints();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Show/hide loading state
function showLoading(show) {
    const form = document.getElementById('access-point-form');
    if (show) {
        form.classList.add('loading');
    } else {
        form.classList.remove('loading');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
}

function isRequiredField(fieldName) {
    const requiredFields = [
        'nasid', 'location_name', 'street_address', 'city', 'zip_code', 'country',
        'latitude', 'longitude', 'wifi_group', 'wifi_type_categorization',
        'ap_make', 'ap_model', 'estimated_upload_speed', 'estimated_download_speed',
        'isp', 'ssid', 'foot_traffic_estimates'
    ];
    return requiredFields.includes(fieldName);
}

// Make showTab globally available
window.showTab = showTab;
window.loadAccessPoints = loadAccessPoints;
