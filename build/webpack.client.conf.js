'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');
const ManifestPlugin = require('webpack-manifest-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const chalk = require('chalk');
module.exports = (projectRoot, config) => {
  const baseWebpackConfig = require('./webpack.base.conf')(projectRoot, config, { extract: true });
  const clientWebpackConfig = merge(baseWebpackConfig, {
    resolve: {
      alias: {
        vue: 'vue/dist/vue.common.js',
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        isBrowser: true,
      }),
      new webpack.NoEmitOnErrorsPlugin(), // 报错但不退出webpack进程
      // CommonsChunkPlugin 的插件，它用于提取多个入口文件的公共脚本部分，然后生成一个 vendor.js 来方便多页面之间进行复用
      new webpack.optimize.CommonsChunkPlugin({
        names: config.build.commonsChunk,
      }),
      new ProgressBarPlugin({
        width: 100,
        format: 'webpack build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
        clear: false,
      }),
      new ManifestPlugin({
        fileName: '../config/manifest.json',
        basePath: '/',
      }),
    ],
  });
  return clientWebpackConfig;
};
