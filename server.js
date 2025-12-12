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

const allowedOrigins = ["https://skill-test-frontend-ten.vercel.app/"];
app.use(
  "/graphql",
  cors({
    origin: function (origin, cb) {
      // allow non-browser tools like curl/postman (no origin)
      if (!origin) return cb(null, true);
      return allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(new Error("Not allowed by CORS: " + origin));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  }),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = decodeToken(token.replace("Bearer ", ""));
      return { user };
    },
  })
);

// Preflight
app.options("/graphql", cors());

app.listen(4000, () =>
  console.log(" GraphQL running at http://localhost:4000/graphql")
);
