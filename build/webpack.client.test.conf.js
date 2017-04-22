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
  const customTestWebpackConfig = loader.getCustomWebpackConfig(config.build.webpackClientTestConfig);
  const clientTestConfig = {
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

  const testConfig = config.env && config.env.test;
  if (testConfig && testConfig.uglifyJs) {
    clientTestConfig.plugins.push(Utils.getUglifyJsConfig(testConfig, {
      globalDefs: {
        isBrowser: true,
        PROD: false
      }
    }));
  }

  const testWebpackConfig = merge(clientWebpackConfig, clientTestConfig, customTestWebpackConfig);

  entryConfig.htmlConfig.forEach(entry => {
    testWebpackConfig.plugins.push(
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

  Utils.saveBuildConfig(projectRoot, testWebpackConfig, config, 'test');

  return testWebpackConfig;
};
