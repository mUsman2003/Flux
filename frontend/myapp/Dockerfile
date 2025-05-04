# Use an official Node.js runtime as a parent image
FROM node:22-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json first for efficient caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Use Nginx to serve the built files
FROM nginx:alpine

# Copy the built React files to Nginx's serving directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose the port on which Nginx serves the app
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]