const Nope = require("nope-validator");
const { PrismaClient } = require("@prisma/client");
const { throwError } = require("../methods/throwError");
const { getUser } = require("../methods/getUser");
const prisma = new PrismaClient();

module.exports = {
  createTask: async (args, context) => {
    let result, errors;

    console.log(args.input.name);

    if (context.headers.authorization) {
      const tasks = await prisma.tasks.findMany({
        where: {
          user: {
            token: context.headers.authorization,
          },
        },
      });

      const namesTasks = tasks.map((item) => item.name);

      const createTaskSchema = Nope.object().shape({
        name: Nope.string()
          .atLeast(5, "Please provide a longer name task")
          .atMost(255, "Name task is too long!")
          .required()
          .notOneOf([...namesTasks], "Name task is already use"),
      });

      errors = createTaskSchema.validate({
        ...args.input,
      });

      console.log(args.input);

      if (!errors) {
        const today = new Date(),
          now = today.toLocaleString();

        result = await prisma.tasks.create({
          data: {
            name: args.input.name,
            dateCreated: now,
            user: {
              connect: {
                token: context.headers.authorization,
              },
            },
          },
        });
      }
    } else throwError("Not found authorization token");

    return {
      errors: errors ? JSON.stringify(errors) : false,
      success: result ? true : false,
    };
  },
  updateTask: async (args, context) => {
    let result, errors;

    if (context.headers.authorization) {
      let validation = {
        id: Nope.number().integer().required(),
      };

      if (args.input.name)
        validation = {
          ...validation,
          name: Nope.string()
            .atLeast(5, "Please provide a longer name task")
            .atMost(255, "Name task is too long!"),
        };

      const updateTaskSchema = Nope.object().shape(validation);
      errors = updateTaskSchema.validate({
        ...args.input,
      });

      if (!errors) {
        if (args.input.name) {
          result = await prisma.tasks.update({
            where: {
              id: args.input.id,
            },
            data: {
              name: args.input.name,
            },
          });
        } else if (args.input.date) {
          const datesFind = await prisma.dates.findMany({
            where: {
              tasksId: args.input.id,
            },
          });

          const index = datesFind.findIndex(
            (date) => date.date === args.input.date
          );

          if (index < 0) {
            result = await prisma.dates.create({
              data: {
                date: args.input.date,
                tasks: {
                  connect: {
                    id: args.input.id,
                  },
                },
              },
            });
          }
        } else if (args.input.status) {
          console.log(args.input.where);

          const dateFind = await prisma.dates.findMany({
            where: {
              tasksId: args.input.id,
              date: args.input.where,
            },
          });

          result = await prisma.dates.update({
            where: {
              id: dateFind[0].id,
            },
            data: {
              status: JSON.parse(args.input.status),
            },
          });
        }
      }
    } else throwError("Not found authorization token");

    return {
      errors: errors ? JSON.stringify(errors) : false,
      success: result ? true : false,
    };
  },
  deleteTask: async (args, context) => {
    let result, errors;

    if (context.headers.authorization) {
      const userFind = await getUser(context.headers.authorization);

      if (!userFind)
        throwError("No user found with provided token", "NOT_AUTH");
      else {
        const deleteTaskSchema = Nope.object().shape({
          id: Nope.number().integer().required(),
        });

        errors = deleteTaskSchema.validate({
          ...args.input,
        });

        if (!errors) {
          const task = await prisma.tasks.findUnique({
            where: {
              id: args.input.id,
            },
          });
          if (!task) throwError("No task found with provided id");
          else
            result = await prisma.tasks.delete({
              where: {
                id: args.input.id,
              },
            });
        }
      }
    } else throwError("Not found authorization token");

    return {
      errors: errors ? JSON.stringify(errors) : false,
      success: result ? true : false,
    };
  },
};
