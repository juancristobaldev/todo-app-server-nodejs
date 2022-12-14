const Nope = require('nope-validator');
const {PrismaClient} = require('@prisma/client');
const { throwError } = require('../methods/throwError');
const prisma = new PrismaClient()

module.exports = {
    createTask:(args,context) => {
        if(context.headers.authorization)
    },
    updateTask:() => {

    },
    deleteTask:() => {

    },
}