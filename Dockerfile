# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy source code
COPY . .

# Expose app port
EXPOSE 3001

# Start the server
CMD ["npm", "run", "dev"]
