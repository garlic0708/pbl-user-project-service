import config from "./graphql";
import express from "express";
import {ApolloServer} from "apollo-server-express";
import http from 'http';

const PORT = 4000;
const app = express();

const server = new ApolloServer({
    ...config,
});
server.applyMiddleware({app});

const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
});
