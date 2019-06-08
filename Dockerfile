# use latest version of node
FROM mhart/alpine-node:latest


# bundle source code
COPY package.json ./

RUN npm install

COPY . .

RUN npm run build && npm prune --production

EXPOSE 4000

# start app with yarn
CMD ["npm", "run", "prod"]
