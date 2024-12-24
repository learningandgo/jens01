FROM node:latest

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application source code
COPY . .

# Expose the default Cloud Run port
EXPOSE 8080

# Start the application
CMD ["node", "index.js"]
