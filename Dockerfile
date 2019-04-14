# use latest version of node
FROM mhart/alpine-node:latest


# bundle source code
COPY . .

EXPOSE 4000

RUN npm install

# start app with yarn
CMD ["npm", "run", "prod"]
