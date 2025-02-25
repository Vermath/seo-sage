FROM node:18-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=development \
    VITE_API_URL=http://localhost:8000

# Install dependencies
COPY web/package.json web/package-lock.json* ./
RUN npm ci

# Copy application code
COPY web/ .

# Start the development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]