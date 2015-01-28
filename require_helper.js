var path = require('path');
module.exports = function (localPath) {
  return require(( process.env.APP_DIR_FOR_CODE_COVERAGE || __dirname ) + path.sep + localPath);
};
