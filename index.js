//packages

const { buildSchema } = require("graphql");
const { graphqlHTTP } = require("express-graphql");

const { readFileSync } = require("fs");
const { join } = require("path");

const express = require("express"),
  app = express();

const cors = require("cors");

const session = require("express-session");

const { PrismaClient } = require("@prisma/client");

//env

require("dotenv").config({ path: "./.env" });

const prisma = new PrismaClient();

app.use(cors());

const resolvers = require("./lib/resolvers");

const passport = require("passport");
const { initPassport } = require("./lib/passport/initPassport");

const schema = buildSchema(
  readFileSync(join(__dirname, "lib", "schema.graphql"), "utf-8")
);

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SECRET_EXPRESS_SESSION,
  })
);

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

initPassport(app);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    session: true,
  }),
  (req, res) => {
    const user = JSON.stringify(req.user)
    res.status(200).send(`<!DOCTYPE html>
      <html lang="en">
        <body>
        </body>
        <script>
          window.opener.postMessage(${user}, "http://localhost:3000")
        </script>
      </html>
      `);
  }
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
