'use strict';
process.env.NODE_ENV = 'production';
require('shelljs/global');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const utils = require('./utils');

module.exports = (projectRoot, env, buildConfig) => {

  const defaultConfig = require('../../config/config.default.js')().vuewebpackdev;
  const config = merge(defaultConfig, buildConfig, { build: { env } });

  const buildPath = path.join(projectRoot, config.build.path);
	/* global rm:true */
  rm('-rf', buildPath);

  const serverConfig = require(`../webpack.server.${env}.conf`)(projectRoot, config);
  const clientConfig = require(`../webpack.client.${env}.conf`)(projectRoot, config);

  const publicPath = utils.getPublicPath(clientConfig, config);
  clientConfig.output.publicPath = serverConfig.output.publicPath = publicPath;

  webpack([ serverConfig, clientConfig ], (err, compilation) => {
    if (err) {
      throw err;
    }
    const stats = compilation.stats || [ compilation ];
    stats.forEach(stat => {
      process.stdout.write(stat.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
      }) + '\n');
    });
    buildConfig.buildSuccess && buildConfig.buildSuccess(config, clientConfig, serverConfig);
  });
};
