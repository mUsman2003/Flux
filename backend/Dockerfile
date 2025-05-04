# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the app port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
