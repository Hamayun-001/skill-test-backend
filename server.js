import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import { typeDefs, resolvers } from "./schema.js";
import { decodeToken } from "./auth.js";

const app = express();
const server = new ApolloServer({ typeDefs, resolvers });

await server.start();

app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = decodeToken(token.replace("Bearer ", ""));
      return { user };
    },
  })
);

app.listen(4000, () =>
  console.log(" GraphQL running at http://localhost:4000/graphql")
);
