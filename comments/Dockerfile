# Install latest version of node:aipine image
FROM node:alpine

# Set container working directory to app
WORKDIR /app

# Copy package.json to container
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files to container (this will update per any file changes)
COPY ./ ./

# Start the app
CMD ["npm", "start"]  