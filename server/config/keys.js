if (process.env.NODE_ENV === 'production') {
  //prod set of keys
  module.exports = require('./prod');
} else {
  //dev keys
  module.exports = require('./dev');
}
