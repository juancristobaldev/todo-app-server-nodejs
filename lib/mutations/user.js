const Nope = require("nope-validator");
const { PrismaClient } = require("@prisma/client");
const { throwError } = require("../methods/throwError");
const prisma = new PrismaClient();
const TokenGenerator = require("uuid-token-generator");
const { getUser } = require("../methods/getUser");
const tokengen = new TokenGenerator(256, TokenGenerator.BASE62);

module.exports = {
  createUser: async (args, context) => {
    let result, errors;

    const createUserSchema = Nope.object().shape({
      name: Nope.string()
        .atLeast(5, "Please provide a longer name")
        .atMost(50, "Name is too long!")
        .required("This field is required"),
      email: Nope.string()
        .email("Please provide a valid email")
        .required("This field is required"),
      pass: Nope.string()
        .atLeast(8, "Please provider a password longer than 8 characters")
        .atMost(255, "Password is too long!")
        .required("This field is required"),
      passConfirm: Nope.string()
        .oneOf(
          [Nope.ref("pass")],
          "Please provide a password equal to the above"
        )
        .required(),
    });

    errors = createUserSchema.validate({
      ...args.input,
    });

    const userFind = await prisma.users.findUnique({
      where: {
        email: args.input.email,
      },
    });

    if (userFind) errors = { ...errors, email: "This email is already used" };

    if (!errors)
      result = await prisma.users.create({
        data: {
          email: args.input.email,
          name: args.input.name,
          pass: args.input.pass,
          token: tokengen.generate(),
        },
      });

    return {
      errors: errors ? JSON.stringify(errors) : false,
      success: result ? true : false,
    };
  },
  updateUser: async (args, context) => {
    let result, errors;

    if (context.headers.authorization) {
      const userFind = await getUser(context.headers.authorization);

      if (!userFind)
        throwError("No user found with provided token", "NOT_AUTH");

      const { name, email, pass } = userFind;

      const updateUserSchema = Nope.object().shape({
        name: Nope.string()
          .atLeast(5, "Please provide a new name")
          .atMost(50, "Name is too long!")
          .notOneOf([name], "It cannot be the same as the previous one"),
        email: Nope.string()
          .email("Please provide a valid email")
          .notOneOf([user], "It cannot be the same as the previous one"),
        pass: Nope.string()
          .atLeast(8, "Please provider a password longer than 8 characters.")
          .atMost(255, "Password is too long!")
          .notOneOf([pass], "It cannot be the same as the previous one"),
      });

      errors = updateUserSchema.validate({
        ...args.input,
      });

      if (args.input.user) {
        const userOld = await prisma.users.findUnique({
          where: {
            user: args.input.user,
          },
        });

        if (userOld)
          errors = { ...errors, user: "This username already exist" };
      }

      if (!errors)
        result = await prisma.users.update({
          where: {
            id: userFind.id,
          },
          data: {
            ...args.input,
          },
        });

      return {
        errors: errors ? JSON.stringify(errors) : false,
        success: result ? true : false,
      };
    } else throwError("Not found authorization token", "NOT_AUTH");
  },
  deleteUser: async (args, context) => {
    let result, errors;

    if (context.headers.authorization) {
      const user = await getUser(context.headers.authorization);

      if (!user) throwError("No user found with provided token", "NOT_AUTH");
      else
        result = await prisma.users.delete({
          where: {
            id: user.id,
          },
        });
    } else throwError("Not found authorization token", "NOT_AUTH");

    return {
      errors: errors ? JSON.stringify(errors) : false,
      success: result ? true : false,
    };
  },
  signInUser: async (args) => {
    let result, errors, token;

    const signInUserSchema = Nope.object().shape({
      email: Nope.string().required("Please provide a valid email."),
      pass: Nope.string().required("Please provide a password."),
    });

    errors = signInUserSchema.validate({
      ...args.input,
    });

    if (!errors) {
      const userFind = await prisma.users.findUnique({
        where: {
          email: args.input.email,
        },
      });

      if (!userFind)
        errors = { ...errors, email: "This email does not exist!" };
      else if (args.input.pass === userFind.pass) {
        result = true;
        token = userFind.token;
      } else errors = { ...errors, pass: "Incorrect password." };
    }

    return {
      errors: errors ? JSON.stringify(errors) : false,
      success: result ? true : false,
      token: result ? token : "",
    };
  },
};
