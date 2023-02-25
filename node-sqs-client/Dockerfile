# It will pull node:18-alpine as the base image from Docker Hub
FROM node:18-alpine

# It creates the container working directory named `node`
WORKDIR /node

# It copies all the dependencies and libraries to the working directory
COPY package.json .

#It installs all the dependencies and libraries to the container
RUN npm install

#It copies all the source code and configuration files to the container working directory
COPY . .

#it exposes and runs the container to port 4000
EXPOSE 4000

#It is the command to start and run the container for the Node.js application
CMD ["node", "index.js"]