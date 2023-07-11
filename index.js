//packages

const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");

const { readFileSync } = require("fs");
const { join } = require("path");

const express = require("express"),
  app = express();

const cors = require("cors");

const { PrismaClient } = require("@prisma/client");

//env

require("dotenv").config({ path: "./.env" });

const prisma = new PrismaClient();

app.use(cors());

const resolvers = require("./lib/resolvers");

const schema = buildSchema(
  readFileSync(join(__dirname, "lib", "schema.graphql"), "utf-8")
);

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

setInterval(async () => {
  const users = await prisma.users.findMany();
  console.log(users);
}, 34560);

// port

const port = process.env.PORT;

// routes

app.get("/", (req, res) => {
  console.log(req.headers.host);
  res.send("Welcome to my Api in Vercel 🚀 ");
});

// server
app.listen(port, () => {
  console.log(`🚀 Server running at: ${port}`);
});
