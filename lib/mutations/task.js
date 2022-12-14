const Nope = require('nope-validator');
const {PrismaClient} = require('@prisma/client');
const { throwError } = require('../methods/throwError');
const { getUser } = require('../methods/getUser');
const prisma = new PrismaClient()

module.exports = {
    createTask: async (args,context) => {
        let result, errors;

        console.log(args.input.task)

        if(context.headers.authorization){

            const userFind = await getUser(context.headers.authorization)

            if(!userFind) throwError('No user found with provided token','NOT_AUTH')     
            else {
                const tasks = await prisma.tasks.findMany({where:{
                    userId:userFind.id
                }})

                const namesTasks = tasks.map(item => item.task)

                const createTaskSchema = Nope.object().shape({
                    task:Nope.string().atLeast(5,'Please provide a longer name task').atMost(255,'Name task is too long!').required().notOneOf([...namesTasks],'Name task is already use'),
                })

                errors = createTaskSchema.validate({
                    ...args.input
                })

                if(!errors){
                    const today = new Date(),
                    now = today.toLocaleString();


                    result = await prisma.tasks.create({
                        data:{
                            task:args.input.task,
                            userId:userFind.id,
                            dateCreated:now,
                            status:"false"
                        }
                    })
                }
            }     
        } else throwError('Not found authorization token')
        
        return {
            errors:errors ? JSON.stringify(errors) : false,
            success:result ? true : false
        }
        
    },
    updateTask: async ( args, context ) => {
        let result, errors;

        if(context.headers.authorization){

            const userFind = await getUser(context.headers.authorization)

            if(!userFind) throwError('No user found with provided token','NOT_AUTH')     
            else {  
                const tasks = await prisma.tasks.findMany({where:{
                    userId:userFind.id
                }})

                const namesTasks = tasks.map(item => item.task)

                const updateTaskSchema = Nope.object().shape({
                    id:Nope.number().integer().required(),
                    task:Nope.string().atLeast(5,'Please provide a longer name task').atMost(255,'Name task is too long!').notOneOf([...namesTasks],'Name task is already use'),
                    status:Nope.string().atLeast(4).atMost(5)
                })

                errors = updateTaskSchema.validate({
                    ...args.input
                })

                if(!errors) result = await prisma.tasks.update({
                    where:{
                        id:args.input.id
                    },
                    data:{
                        ...args.input
                    }
                })
            }     
        } else throwError('Not found authorization token')

        return {
            errors:errors ? JSON.stringify(errors) : false,
            success:result ? true : false
        }
    },
    deleteTask: async ( args, context ) => {
        let result, errors;

        if(context.headers.authorization){

            const userFind = await getUser(context.headers.authorization)

            if(!userFind) throwError('No user found with provided token','NOT_AUTH')     
            else {

                const deleteTaskSchema = Nope.object().shape({
                    id:Nope.number().integer().required(),
                })
                
                errors = deleteTaskSchema.validate({
                    ...args.input
                })
                
                if(!errors) {
                    const task = await prisma.tasks.findUnique({
                        where:{
                            id:args.input.id
                        }
                    })
                    if(!task) throwError('No task found with provided id')
                    else result = await prisma.tasks.delete({
                        where:{
                            id:args.input.id
                        }
                    })
                }
            }     
        } else throwError('Not found authorization token')

        return {
            errors:errors ? JSON.stringify(errors) : false,
            success:result ? true : false
        }
    },
}