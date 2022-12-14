const { GraphQLError } = require('graphql')

const throwError = (message,code) => {
    throw new GraphQLError(message,{
        extensions:{ code:code }
    })
}


module.exports = {throwError}