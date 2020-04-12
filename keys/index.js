const prodMod = require('./keys.prod');
const devMod = require('./keys.dev');

if (process.env.NODE_ENV === 'production') {
  module.exports = prodMod;
} else {
  module.exports = devMod;
}
