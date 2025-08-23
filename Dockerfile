# BuffrSign Platform Backend Dockerfile
# Multi-stage build for production optimization

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S buffsign -u 1001

# Set working directory
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    cairo \
    jpeg \
    pango \
    musl \
    giflib \
    pixman \
    pangomm \
    libjpeg-turbo \
    freetype

# Copy built application from builder stage
COPY --from=builder --chown=buffsign:nodejs /app/dist ./dist
COPY --from=builder --chown=buffsign:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=buffsign:nodejs /app/package*.json ./

# Copy legal knowledge base if it exists
COPY --from=builder --chown=buffsign:nodejs /app/legal-kb ./legal-kb

# Create necessary directories
RUN mkdir -p /app/uploads /app/logs /app/temp && \
    chown -R buffsign:nodejs /app/uploads /app/logs /app/temp

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV UPLOADS_DIR=/app/uploads
ENV LOGS_DIR=/app/logs
ENV TEMP_DIR=/app/temp

# Expose port
EXPOSE 3000

# Switch to non-root user
USER buffsign

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]

# Metadata labels
LABEL org.opencontainers.image.title="BuffrSign Platform Backend"
LABEL org.opencontainers.image.description="AI-powered digital signature platform for Namibia & SADC"
LABEL org.opencontainers.image.vendor="BuffrSign"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.url="https://buffsign.com"
LABEL org.opencontainers.image.documentation="https://docs.buffsign.com"
LABEL org.opencontainers.image.source="https://github.com/buffsign/platform"