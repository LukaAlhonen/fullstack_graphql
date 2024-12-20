const { ApolloServer } = require("@apollo/server");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { expressMiddleware } = require("@apollo/server/express4");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");

const http = require("http");
const express = require("express");
const cors = require("cors");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const jwt = require("jsonwebtoken");

const User = require("./models/users");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const createLoaders = require("./loaders");

// MongoDB config
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("Connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to", MONGODB_URI);
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error.message);
  });

mongoose.set("debug", true);

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer(
    {
      schema,
      context: async () => {
        const loaders = createLoaders();
        return { loaders };
      },
    },
    wsServer,
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null;
        let currentUser = null;
        if (auth && auth.startsWith("Bearer ")) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.JWT_SECRET,
          );
          currentUser = await User.findById(decodedToken.id);
        }

        // Init loaders and add to contex
        const loaders = createLoaders();

        return { currentUser, loaders };
      },
    }),
  );

  const PORT = 4000;

  httpServer.listen(PORT, () =>
    console.log(`Server ready at http://localhost:${PORT}`),
  );
};

start();
