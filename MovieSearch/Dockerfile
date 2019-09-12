FROM node:boron

# Copy app from source
COPY . /src

# Set working directory to source
WORKDIR /src

# Install app dependancies
RUN npm install

# Expose app to world
EXPOSE 3000

# start command as per package.json
CMD ["npm", "start"]