# Use an official Node.js runtime as a parent image
FROM node:19

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install additional packages needed by Puppeteer
RUN apt-get update && apt-get install -y \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxi6 \
    libxtst6 \
    libxrandr2 \
    libdrm2 \
    libgbm1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories and set permissions
RUN mkdir -p /usr/src/app/.wwebjs_auth/session && \
    chown -R node:node /usr/src/app

# Create a non-root user and switch to it
USER node

# Copy the rest of your application code
COPY --chown=node:node . .

# Expose the application port (e.g., 3000)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
