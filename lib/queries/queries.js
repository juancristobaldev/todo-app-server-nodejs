const tasks = require('./task')
const users = require('./user')
 
module.exports = {
    ...users,
    ...tasks
}

