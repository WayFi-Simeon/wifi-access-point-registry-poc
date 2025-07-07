#!/bin/bash

# WiFi Access Point Registry - Docker Runner Script

echo "🐳 WiFi Access Point Registry Docker Runner"
echo "==========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo ""
    echo "Please install Docker first:"
    echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "  Linux: https://docs.docker.com/engine/install/"
    echo ""
    exit 1
fi

# Check if Docker Compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose is not available."
    echo "Please install Docker Compose or use Docker Desktop which includes it."
    exit 1
fi

echo "✅ Docker found: $(docker --version)"
echo "✅ Docker Compose found: $($COMPOSE_CMD --version)"
echo ""

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running."
    echo "Please start Docker Desktop or the Docker daemon."
    exit 1
fi

echo "✅ Docker daemon is running"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "🚀 Starting WiFi Access Point Registry..."
echo ""

# Ask user which version to run
echo "Choose deployment option:"
echo "1) SQLite (lightweight, good for development/testing)"
echo "2) PostgreSQL (production-ready with separate database)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "🗄️  Starting with SQLite..."
        $COMPOSE_CMD up -d wifi-registry
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Application started successfully!"
            echo "🌐 Access the application at: http://localhost:3000"
            echo ""
            echo "Useful commands:"
            echo "  View logs: $COMPOSE_CMD logs -f wifi-registry"
            echo "  Stop: $COMPOSE_CMD down"
            echo "  Restart: $COMPOSE_CMD restart wifi-registry"
        else
            echo "❌ Failed to start the application"
            exit 1
        fi
        ;;
    2)
        echo "🗄️  Starting with PostgreSQL..."
        $COMPOSE_CMD --profile postgres up -d
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Application started successfully!"
            echo "🌐 Access the application at: http://localhost:3001"
            echo "🗄️  PostgreSQL database available at: localhost:5432"
            echo ""
            echo "Database credentials:"
            echo "  Database: wifi_registry"
            echo "  Username: wifi_user"
            echo "  Password: wifi_password"
            echo ""
            echo "Useful commands:"
            echo "  View app logs: $COMPOSE_CMD logs -f wifi-registry-postgres"
            echo "  View DB logs: $COMPOSE_CMD logs -f postgres"
            echo "  Stop: $COMPOSE_CMD --profile postgres down"
            echo "  Restart: $COMPOSE_CMD --profile postgres restart"
        else
            echo "❌ Failed to start the application"
            exit 1
        fi
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
        exit 1
        ;;
esac

echo ""
echo "📊 Container status:"
$COMPOSE_CMD ps

echo ""
echo "🎉 Setup complete! The application should be accessible in your browser."
echo ""
echo "To stop the application:"
if [ "$choice" = "1" ]; then
    echo "  $COMPOSE_CMD down"
else
    echo "  $COMPOSE_CMD --profile postgres down"
fi
