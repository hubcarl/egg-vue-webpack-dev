'use strict';
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

module.exports = (projectRoot, config) => {
  const nodeModules = {};
  fs.readdirSync('node_modules').filter(x => {
    return [ '.bin' ].indexOf(x) === -1;
  }).forEach(mod => {
    nodeModules[mod] = 'commonjs ' + mod;
  });

  const entryConfig = require('./lib/entry')(projectRoot, config);
  const baseWebpackConfig = require('./webpack.base.conf')(projectRoot, config);
  const serverWebpackConfig = merge(baseWebpackConfig, {
    target: 'node', // !different
    entry: entryConfig.entry,
    output: {
      libraryTarget: 'commonjs2',
      path: path.join(projectRoot, 'app/view')
    },
    resolve: {
      alias: {
        vue: 'vue/dist/vue.runtime.common.js'
      }
    },
		// https://zhuanlan.zhihu.com/p/20782320
		// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
		// npm 中的模块也会被打包进这个 bundle.js，还有 node 的一些原生模块，比如 fs/path 也会被打包进来，这明显不是我们想要的。所以我们得告诉 webpack，你打包的是 node 的代码，原生模块就不要打包了，还有 node_modules 目录下的模块也不要打包了
    context: __dirname,
    node: {
      __filename: false,
      __dirname: false
    },
    externals: nodeModules,
    plugins: [
			// new webpack.optimize.DedupePlugin(),
			// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
			// The IgnorePlugin will simply avoid generating that extra chunk, but doesn't help when you want to actually tell the server-side to ignore a top-level require
      new webpack.NormalModuleReplacementPlugin(/\.css$/, 'node-noop'),
      new webpack.IgnorePlugin(/\.(css|less|scss|sass)$/),
      new webpack.IgnorePlugin(/vue-resource/),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: '"production"',
          VUE_ENV: '"server"' // 配置 vue 的环境变量，告诉 vue 是服务端渲染，就不会做耗性能的 dom-diff 操作了
        },
        isBrowser: false
      })
    ]
  });

  return serverWebpackConfig;
};
