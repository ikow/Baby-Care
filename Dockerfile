FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++ tzdata

# Create app directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY ./backend/package*.json ./

# Install dependencies
RUN npm install --production \
    && npm install -g nodemon \
    && npm cache clean --force

# Copy application code
COPY ./backend .

# Create necessary directories and set permissions
RUN mkdir -p backups logs data \
    && chown -R node:node /usr/src/app \
    && chmod -R 755 /usr/src/app

# Switch to non-root user
USER node

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

# Start the application
CMD ["npm", "start"] 