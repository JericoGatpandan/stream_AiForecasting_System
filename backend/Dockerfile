FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Use npm ci for production builds - faster and more reliable
RUN npm ci --only=production

# Bundle app source
COPY . .

# Expose the API port
EXPOSE 5500

# Command to run the app
CMD ["npm", "start"]