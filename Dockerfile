# Use a lightweight Node 18 base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files first (for better caching of npm install)
COPY package*.json ./

# Install dependencies (including dev dependencies)
RUN npm install

# Copy the rest of your application code
COPY . .

# If your dev server runs on a certain port (e.g., 3000 for Next.js, 5173 for Vite), expose it.
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev"]
