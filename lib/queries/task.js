const { PrismaClient } = require("@prisma/client");
const { getUser } = require("../methods/getUser");
const { throwError } = require("../methods/throwError");
const prisma = new PrismaClient();

module.exports = {
  getTask: async (args, context) => {
    if (context.headers.authorization) {
      const userFind = await getUser(context.headers.authorization);

      if (!userFind)
        throwError("No user found with provided token", "NOT_AUTH");

      return await prisma.tasks.findUnique({
        where: {
          id: args.id,
        },
      });
    } else throwError("Not found token authorization", "UNAUTH");
  },
  getTasks: async (args, context) => {
    if (context.headers.authorization) {
      const userFind = await getUser(context.headers.authorization);

      if (!userFind)
        throwError("No user found with provided token", "NOT_AUTH");

      return await prisma.tasks
        .findMany({
          where: {
            user: {
              token: context.headers.authorization,
            },
          },
        })
        .catch((error) => console.error(error));
    } else throwError("Not found token authorization", "UNAUTH");
  },
};
