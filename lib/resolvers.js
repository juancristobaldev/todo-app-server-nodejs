const mutations = require('./mutations/mutations')
const queries = require('./queries/queries')
module.exports = {
...queries,
...mutations
}