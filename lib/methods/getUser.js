const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getUser = async (token) => {
  const user = await prisma.users.findUnique({
    where: {
      token: token,
    },
    include: {
      tasks: true,
    },
  });

  return user;
};

module.exports = { getUser };
