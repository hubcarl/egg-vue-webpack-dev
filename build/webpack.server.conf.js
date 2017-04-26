'use strict';
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

/**
 * Node.js 内置模块和node_modules不打包
 * @see http://jlongster.com/Backend-Apps-with-Webpack--Part-I
 * @param {String}  projectRoot 项目根目录
 * @param {Object}  config  插件配置
 * @return {Object} server 配置
 */
module.exports = (projectRoot, config) => {
  const loader = require('./lib/loader')(projectRoot, config);
  const entryConfig = require('./lib/entry')(projectRoot, config);
  const baseWebpackConfig = require('./webpack.base.conf')(projectRoot, config, { extract: false });
  const serverWebpackConfig = merge(baseWebpackConfig, {
    target: 'node', // !different
    entry: entryConfig.entry,
    output: {
      libraryTarget: 'commonjs2',
      path: path.join(projectRoot, 'app/view'),
    },
    resolve: {
      alias: {
        vue: 'vue/dist/vue.runtime.common.js',
      },
    },
    context: __dirname,
    node: {
      __filename: false,
      __dirname: false,
    },
    externals: loader.loadNodeModules(),
    plugins: [
      new webpack.IgnorePlugin(/\.(css|less|scss|sass)$/),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
          VUE_ENV: '"server"', // 配置 vue 的环境变量，告诉 vue 是服务端渲染，就不会做耗性能的 dom-diff 操作了
        },
        isBrowser: false,
      }),
    ],
  });

  return serverWebpackConfig;
};
