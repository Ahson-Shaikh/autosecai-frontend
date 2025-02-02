FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files first (better cache)
COPY package*.json ./

# Install all dependencies (including devDeps)
RUN npm install

# Copy the rest of your code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Run "npm run dev" with "--host 0.0.0.0" so it's accessible externally
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]