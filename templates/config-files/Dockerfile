  FROM node:20 AS base
  # Create app directory
  WORKDIR /app
  
  # ---- Dependencies ----
  FROM base AS dependencies  
  # A wildcard is used to ensure both package.json AND package-lock.json are copied
  COPY package*.json ./
  # install app dependencies including 'devDependencies'
  RUN npm install
  
  # ---- Copy Files/Build ----
  FROM dependencies AS build  
  WORKDIR /app
  COPY src /app
  RUN npm run build
  
  # --- Release with Alpine ----
  FROM node:20-alpine AS release  
  # Create app directory
  WORKDIR /app
  # optional
  # RUN npm -g install serve
  COPY --from=dependencies /app/package.json ./
  # Install app dependencies
  RUN npm install --only=production
  COPY --from=build /app ./
  
  CMD ["node", "index.js"]