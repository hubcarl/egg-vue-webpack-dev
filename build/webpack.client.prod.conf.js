'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Utils = require('./lib/utils');

module.exports = (projectRoot, config) => {
  config.build.sourceMap = false;
  const loader = require('./lib/loader')(projectRoot, config);
  const entryConfig = require('./lib/entry')(projectRoot, config);
  const clientWebpackConfig = require('./webpack.client.conf')(projectRoot, config);
  const customProdWebpackConfig = loader.getCustomWebpackConfig(config.build.webpackClientProdConfig);
  const clientProdConfig = {
    entry: entryConfig.entry,
    module: {
      rules: loader.styleLoaders({
        sourceMap: config.build.sourceMap,
        extract: true
      })
    },
    devtool: config.build.sourceMap ? 'source-map' : false,
    output: {
      filename: loader.assetsPath('js/[name].[chunkhash:7].js'),
      chunkFilename: loader.assetsPath('js/[id].[chunkhash:7].js')
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"'
        }
      }),
      new ExtractTextPlugin(loader.assetsPath('css/[name].[contenthash:7].css')),
      new webpack.LoaderOptionsPlugin({
        minimize: true
      })
    ]
  };

  const prodConfig = config.env && config.env.prod;
  if (prodConfig && prodConfig.uglifyJs) {
    clientProdConfig.plugins.push(Utils.getUglifyJsConfig(prodConfig, { globalDefs: { isBrowser: true, PROD: true } }));
  }

  const prodWebpackConfig = merge(clientWebpackConfig, clientProdConfig, customProdWebpackConfig);

  entryConfig.htmlConfig.forEach(entry => {
    prodWebpackConfig.plugins.push(
      new HtmlWebpackPlugin({
        chunks: config.build.commonsChunk,
        filename: entry.filename + '.html',
        template: entry.template,
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        }
      })
    );
  });

  Utils.saveBuildConfig(projectRoot, prodWebpackConfig, config, 'prod');

  return prodWebpackConfig;
};
