# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy backend source code
COPY backend/ ./

# Copy frontend files
COPY frontend/ ./public/

# Copy database schema
COPY database/ ./database/

# Create database directory
RUN mkdir -p database

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV DB_TYPE=sqlite
ENV SQLITE_DB_PATH=./database/registry.db
ENV PORT=3000

# Initialize database and start application
CMD ["sh", "-c", "npm run init-db && npm start"]
