'use strict';

const merge = require('webpack-merge');
const Utils = require('./lib/utils');
module.exports = (projectRoot, config) => {
  const loader = require('./lib/loader')(projectRoot, config);
  const serverWebpackConfig = require('./webpack.server.conf')(projectRoot, config);
  const customServerWebpackConfig = loader.getCustomWebpackConfig(config.build.webpackServerTestConfig);
  const serverTestConfig = {
    plugins: []
  };
  const testConfig = config.env && config.env.test;

  if (testConfig && testConfig.uglifyJs) {
    serverTestConfig.plugins.push(Utils.getUglifyJsConfig(testConfig, {
      globalDefs: {
        isBrowser: false,
        PROD: false
      }
    }));
  }

  const serverTestWebpackConfig = merge(serverWebpackConfig, serverTestConfig, customServerWebpackConfig);

  return serverTestWebpackConfig;
};
