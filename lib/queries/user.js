const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
    getUsers: async () => await prisma.users.findMany(),
    getUser: async (args,context) => {
        console.log(context.headers)
    },
}
