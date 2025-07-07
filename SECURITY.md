# Security Guidelines

## Overview

This WiFi Access Point Registry application has been designed with security best practices in mind. This document outlines the security measures implemented and guidelines for secure deployment.

## Security Measures Implemented

### 1. Environment Variable Configuration

- **No hardcoded credentials**: All sensitive configuration is handled through environment variables
- **Example configuration**: `.env.example` provides template with placeholder values
- **Docker environment**: Uses environment variable substitution with secure defaults

### 2. Database Security

- **Parameterized queries**: All database queries use parameterized statements to prevent SQL injection
- **Database abstraction**: Generic database layer supports both SQLite and PostgreSQL
- **Connection management**: Proper connection handling with graceful shutdown

### 3. Input Validation

- **Server-side validation**: All API endpoints validate input data
- **Data sanitization**: User inputs are properly escaped and validated
- **Type checking**: Numeric fields are properly converted and validated

### 4. API Security

- **CORS configuration**: Configurable CORS origins through environment variables
- **Request size limits**: JSON payload size limited to 10MB
- **Error handling**: Secure error messages that don't expose internal details
- **Health check endpoint**: Non-sensitive health monitoring

### 5. Frontend Security

- **XSS prevention**: All user-generated content is properly escaped
- **No client-side secrets**: No API keys or sensitive data in frontend code
- **Relative API paths**: Uses relative paths to prevent hardcoded endpoints

## Deployment Security Recommendations

### 1. Environment Variables

When deploying to production, ensure you set secure values for:

```bash
# Database credentials (for PostgreSQL)
POSTGRES_USER=your_secure_username
POSTGRES_PASSWORD=your_very_secure_password_here

# CORS origins (restrict to your domain)
ALLOWED_ORIGINS=https://yourdomain.com

# Use production environment
NODE_ENV=production
```

### 2. Database Security

#### For SQLite:
- Ensure database file has proper file permissions (600)
- Store database in a secure location outside web root
- Regular backups with encryption

#### For PostgreSQL:
- Use strong, unique passwords
- Enable SSL/TLS connections
- Configure proper user permissions
- Regular security updates
- Network isolation (firewall rules)

### 3. Network Security

- **HTTPS only**: Always use HTTPS in production
- **Firewall rules**: Restrict database access to application servers only
- **VPN/Private networks**: Use private networks for database connections
- **Rate limiting**: Implement rate limiting at reverse proxy level

### 4. Container Security

- **Non-root user**: Application runs as non-root user in container
- **Minimal base image**: Uses Alpine Linux for smaller attack surface
- **Health checks**: Proper health monitoring for container orchestration
- **Resource limits**: Set appropriate CPU and memory limits

### 5. Monitoring and Logging

- **Access logs**: Monitor API access patterns
- **Error monitoring**: Track application errors and anomalies
- **Database monitoring**: Monitor database performance and access
- **Security scanning**: Regular vulnerability scans

## Security Checklist for Production

- [ ] All environment variables set with secure values
- [ ] Database credentials are strong and unique
- [ ] CORS origins restricted to your domain(s)
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Database connections encrypted (SSL/TLS)
- [ ] Firewall rules configured
- [ ] Regular security updates applied
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Access logs reviewed regularly

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** create a public GitHub issue
2. Email security concerns to the project maintainers
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Security Updates

- Keep all dependencies updated regularly
- Monitor security advisories for Node.js and dependencies
- Apply security patches promptly
- Test security updates in staging environment first

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
