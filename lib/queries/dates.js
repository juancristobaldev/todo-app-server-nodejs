const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getDate = async (args, context) => {
  if (context.headers.authorization) {
    let result;

    result = await prisma.dates.findUnique({
        where:{
            id: args.id
        },
        include:{
            tasks:{
                include:{
                    
                }
            }
        }
    })
  } else {
    console.log("Token de autenticacion no encontrado");
  }
};
