const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const passport = require("passport");
const session = require("express-session");

const TokenGenerator = require("uuid-token-generator");
const tokengen = new TokenGenerator(256, TokenGenerator.BASE62);

const initPassport = (app) => {
  require("dotenv").config({ path: "./.env" });

  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SECRET_EXPRESS_SESSION,
    })
  );

  app.use(passport.initialize());

  app.use(passport.session());

  const GoogleStrategy = require("passport-google-oidc");

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.SECRET_CLIENT_ID,
        callbackURL: process.env.CALLBACK_URL,
      },
      async function (issuer, profile, cb) {
        console.log("profile:", profile.emails[0].value);

        const upsertUser = await prisma.users.upsert({
          where: {
            email: profile.emails[0].value,
          },
          update: {},
          create: {
            email: profile.emails[0].value,
            name: profile.displayName,
            pass: profile.id.slice(1,9),
            token: tokengen.generate(),
          },
        });

        return cb(null, upsertUser);
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("serialize:", user);
    done(null, user);
  });

  // Deserialize user from the sessions
  passport.deserializeUser((user, done) => {
    console.log("deserialize:", user);
    done(null, user);
  });
};

module.exports = { initPassport };
