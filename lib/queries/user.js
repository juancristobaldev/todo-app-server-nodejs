const {PrismaClient} = require('@prisma/client');
const { getUser } = require('../methods/getUser');
const { throwError } = require('../methods/throwError');
const prisma = new PrismaClient()

module.exports = {
    getUsers: async () => await prisma.users.findMany(),
    getUser: async (args,context) => {
        if(context.headers.authorization) return getUser(context.headers.authorization)
        else throwError('Not found token authorization','UNAUTH')
    },
}
