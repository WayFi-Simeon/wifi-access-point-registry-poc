#!/bin/bash

echo "🔄 Rebuilding WiFi Access Point Registry Docker container..."
echo "This will force a clean rebuild without using cached layers."
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Clean up any existing containers and images
echo "🧹 Cleaning up existing containers and images..."
docker-compose down 2>/dev/null || true
docker rmi wifi-access-point-registry_wifi-registry 2>/dev/null || true
docker rmi wifi-access-point-registry_wifi-registry-postgres 2>/dev/null || true

# Build without cache
echo "🔨 Building container without cache..."
docker-compose build --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful! Starting the application..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Application started successfully!"
        echo "🌐 Access the application at: http://localhost:3000"
        echo ""
        echo "Useful commands:"
        echo "  View logs: docker-compose logs -f wifi-registry"
        echo "  Stop: docker-compose down"
        echo "  Check status: docker-compose ps"
    else
        echo "❌ Failed to start the application"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi
