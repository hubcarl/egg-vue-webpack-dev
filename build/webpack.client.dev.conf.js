'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Utils = require('./lib/utils');

module.exports = (projectRoot, config) => {
  const loader = require('./lib/loader')(projectRoot, config);
  const entryConfig = require('./lib/entry')(projectRoot, config);
  const clientWebpackConfig = require('./webpack.client.conf')(projectRoot, config);
  const customDevWebpackConfig = loader.getCustomWebpackConfig(config.build.webpackClientDevConfig);
  const clientDevConfig = {
    entry: entryConfig.entry,
    module: {
      rules: loader.styleLoaders({
        extract: true,
      }),
    },
    output: {
      publicPath: Utils.getDevPublicPath(config, 2),
      filename: loader.assetsPath('js/[name].js'),
      chunkFilename: loader.assetsPath('js/[id].js'),
    },
    devtool: 'source-map',
    performance: {
      hints: false,
    },
    plugins: [
      new ExtractTextPlugin(loader.assetsPath('css/[name].css')), // 将css成生文件，而非内联
      new webpack.HotModuleReplacementPlugin(), // 代码热替换
    ],
  };

  const devConfig = config.env && config.env.dev;
  if (devConfig && devConfig.uglifyJs) {
    clientDevConfig.plugins.push(Utils.getUglifyJsConfig(devConfig, { globalDefs: { isBrowser: true, PROD: false } }));
  }

  const devWebpackConfig = merge(clientWebpackConfig, clientDevConfig, customDevWebpackConfig);

  entryConfig.htmlConfig.forEach(entry => {
    devWebpackConfig.plugins.push(
      new HtmlWebpackPlugin({
        chunks: config.build.commonsChunk,
        filename: entry.filename + '.html',
        template: entry.template,
        inject: true,
      })
    );
  });

  const hotConfig = `webpack-hot-middleware/client?path=http://${Utils.getIp()}:${config.build.port}/__webpack_hmr&noInfo=false&reload=false&quiet=false`;
  Object.keys(devWebpackConfig.entry).forEach(name => {
    if (!/\./.test(name)) {
      devWebpackConfig.entry[ name ] = [ hotConfig ].concat(devWebpackConfig.entry[ name ]);
    }
  });

  Utils.saveBuildConfig(projectRoot, devWebpackConfig, config, 'dev');
  return devWebpackConfig;
};
