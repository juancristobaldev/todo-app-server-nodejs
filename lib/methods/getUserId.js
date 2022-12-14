const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getUser = async (token) => {
    const user = await prisma.users.findUnique({
        where:{
            token:token
        }
    })

    return user
}

module.exports = {getUser}