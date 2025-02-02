# ==============================
#  Stage 1: Build
# ==============================
FROM node:18-alpine AS build

# Create and use the app directory
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app’s source code
COPY . .

# Build the production bundles (e.g. CRA uses `npm run build`)
# If using Vite, it might be `npm run build` as well.
RUN npm run build

# ==============================
#  Stage 2: Production
# ==============================
FROM nginx:alpine

# Copy build files from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 in the container
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
