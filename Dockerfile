# Step 1: Use an official lightweight Node.js base image
FROM node:20-alpine

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package files first to leverage Docker cache layers
COPY package*.json ./

# Step 4: Install only runtime production dependencies
RUN npm install --only=production

# Step 5: Copy the rest of the application source code
COPY . .

# Step 6: Expose the network port inside the container
EXPOSE 3000

# Step 7: Define the command execution execution pattern
CMD ["npm", "start"]
