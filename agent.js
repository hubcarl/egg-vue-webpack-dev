'use strict';

module.exports = agent => {
  require('./lib/development-koa-client')(agent);
  require('./lib/development-koa-server')(agent);
};

