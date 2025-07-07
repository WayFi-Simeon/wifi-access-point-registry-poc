# Docker Troubleshooting Guide

## Common Docker Issues and Solutions

### Issue 1: npm ci fails with package-lock.json error
**Error**: `npm ci` command fails during Docker build

**Solution**: This has been fixed by adding a proper `package-lock.json` file. If you still encounter issues:

```bash
# Clean Docker build cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Issue 2: Port already in use
**Error**: `bind: address already in use`

**Solutions**:
1. **Change the port in docker-compose.yml**:
   ```yaml
   ports:
     - "3001:3000"  # Change 3000 to 3001 or any available port
   ```

2. **Find and stop the process using the port**:
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill the process (replace PID with actual process ID)
   kill -9 PID
   ```

3. **Use different ports for different services**:
   - SQLite version: Port 3000
   - PostgreSQL version: Port 3001

### Issue 3: Docker daemon not running
**Error**: `Cannot connect to the Docker daemon`

**Solutions**:
- **macOS/Windows**: Start Docker Desktop
- **Linux**: Start Docker service:
  ```bash
  sudo systemctl start docker
  sudo systemctl enable docker
  ```

### Issue 4: Permission denied errors
**Error**: Permission denied when accessing files

**Solutions**:
1. **Fix file permissions**:
   ```bash
   chmod +x run-docker.sh
   ```

2. **Run Docker with sudo (Linux only)**:
   ```bash
   sudo docker-compose up -d
   ```

3. **Add user to docker group (Linux)**:
   ```bash
   sudo usermod -aG docker $USER
   # Log out and log back in
   ```

### Issue 5: Database initialization fails
**Error**: Database connection or initialization errors

**Solutions**:
1. **Check database volume permissions**:
   ```bash
   docker-compose down -v  # Remove volumes
   docker-compose up -d    # Recreate with fresh volumes
   ```

2. **Check logs for specific errors**:
   ```bash
   docker-compose logs wifi-registry
   ```

3. **Manual database initialization**:
   ```bash
   # Access container shell
   docker-compose exec wifi-registry sh
   
   # Run database initialization manually
   npm run init-db
   ```

### Issue 6: Frontend not loading
**Error**: Application starts but frontend doesn't load

**Solutions**:
1. **Check if container is running**:
   ```bash
   docker-compose ps
   ```

2. **Check application logs**:
   ```bash
   docker-compose logs -f wifi-registry
   ```

3. **Verify port mapping**:
   - Ensure you're accessing the correct port (3000 for SQLite, 3001 for PostgreSQL)

4. **Check browser console for errors**:
   - Open browser developer tools (F12)
   - Look for JavaScript or network errors

### Issue 7: Map not displaying
**Error**: Map tiles don't load or map is blank

**Solutions**:
1. **Check internet connection**: Map tiles are loaded from external servers
2. **Check browser console**: Look for CORS or network errors
3. **Try a different network**: Some corporate networks block map tile servers

### Issue 8: Address search not working
**Error**: Nominatim API requests fail

**Solutions**:
1. **Check internet connection**: API requires external access
2. **Check rate limits**: Nominatim has usage limits
3. **Wait and retry**: API might be temporarily unavailable

## Useful Docker Commands

### Basic Operations
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### Debugging
```bash
# Access container shell
docker-compose exec wifi-registry sh

# View container logs
docker logs <container-id>

# Inspect container
docker inspect <container-id>

# Check resource usage
docker stats
```

### Cleanup
```bash
# Remove containers and networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Remove specific images
docker rmi wifi-access-point-registry_wifi-registry
```

### Development
```bash
# Rebuild after code changes
docker-compose up -d --build

# Force rebuild without cache
docker-compose build --no-cache

# View real-time logs
docker-compose logs -f wifi-registry
```

## Environment-Specific Issues

### macOS
- Ensure Docker Desktop is running
- Check available memory (Docker Desktop settings)
- Verify file sharing permissions in Docker Desktop

### Windows
- Ensure Docker Desktop is running
- Check WSL2 integration if using WSL2
- Verify Hyper-V is enabled (for older Docker versions)

### Linux
- Ensure Docker service is running: `sudo systemctl status docker`
- Check user permissions: `groups $USER` (should include 'docker')
- Verify cgroup configuration

## Performance Optimization

### For Development
```yaml
# In docker-compose.yml, add volume mounts for live reloading
volumes:
  - ./backend:/app
  - ./frontend:/app/public
  - /app/node_modules  # Prevent overwriting node_modules
```

### For Production
```yaml
# Use specific image tags instead of 'latest'
# Optimize Dockerfile with multi-stage builds
# Use .dockerignore to reduce build context
```

## Getting Help

1. **Check logs first**: `docker-compose logs -f`
2. **Verify Docker installation**: `docker --version && docker-compose --version`
3. **Check system resources**: Ensure sufficient memory and disk space
4. **Review this troubleshooting guide**
5. **Check Docker documentation**: https://docs.docker.com/

## Quick Health Check

Run this command to verify everything is working:

```bash
# Health check script
curl -f http://localhost:3000/api/health || echo "Service not responding"
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-07-07T04:39:00.000Z",
  "version": "1.0.0"
}
