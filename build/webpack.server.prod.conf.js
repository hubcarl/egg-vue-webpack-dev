'use strict';

const merge = require('webpack-merge');
const Utils = require('./lib/utils');
module.exports = (projectRoot, config) => {
  const loader = require('./lib/loader')(projectRoot, config);
  const serverWebpackConfig = require('./webpack.server.conf')(projectRoot, config);
  const customServerWebpackConfig = loader.getCustomWebpackConfig(config.build.webpackServerProdConfig);

  const serverProdConfig = {
    plugins: []
  };

  const prodConfig = config.env && config.env.prod;

  if (prodConfig && prodConfig.uglifyJs) {
    serverProdConfig.plugins.push(Utils.getUglifyJsConfig(prodConfig, {
      globalDefs: {
        isBrowser: false,
        PROD: true
      }
    }));
  }

  const serverProdWebpackConfig = merge(serverWebpackConfig, serverProdConfig, customServerWebpackConfig);

  return serverProdWebpackConfig;
};
