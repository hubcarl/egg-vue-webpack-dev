'use strict';

const merge = require('webpack-merge');
const Utils = require('./lib/utils');

module.exports = (projectRoot, config) => {
  const loader = require('./lib/loader')(projectRoot, config);
  const serverWebpackConfig = require('./webpack.server.conf')(projectRoot, config);
  const customServerWebpackConfig = loader.getCustomWebpackConfig(config.build.webpackServerDevConfig);

  const serverDevConfig = {
    plugins: [],
  };
  const devConfig = config.env && config.env.dev;

  if (devConfig && devConfig.uglifyJs) {
    serverDevConfig.plugins.push(Utils.getUglifyJsConfig(devConfig, { globalDefs: { isBrowser: false, PROD: false } }));
  }

  const serverDevWebpackConfig = merge(serverWebpackConfig, serverDevConfig, customServerWebpackConfig);

  return serverDevWebpackConfig;
};
