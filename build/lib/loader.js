'use strict';

const path = require('path');
const fs = require('fs');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (projectRoot, config) => {

  const loader = {};

  loader.getCustomWebpackConfig = function(filePath) {
    if (!filePath) return {};
    const _filePath = path.join(projectRoot, filePath);
    try {
      fs.statSync(_filePath);
      return require(_filePath)(projectRoot, config);
    } catch (err) {
      return {};
    }
  };

  loader.assetsPath = function(_path) {
    return path.posix.join(config.build.staticDir, _path);
  };

  loader.cssLoaders = function(options) {
    options = options || {};

    function generateLoaders(loaders) {
      const sourceLoader = loaders.map(loader => {
        const result = {
          loader,
          options: {}
        };
        if (loader === 'sass-loader' && options.includePaths) {
          result.options.includePaths = options.includePaths;
        }
        return result;
      });

      if (options.extract) {
        return ExtractTextPlugin.extract({
          fallback: 'vue-style-loader',
          use: sourceLoader
        });
      }

      sourceLoader.unshift('vue-style-loader');

      return sourceLoader;
    }

    return {
      css: generateLoaders([ 'css-loader', 'postcss-loader' ]),
      less: generateLoaders([ 'css-loader', 'postcss-loader', 'less-loader' ]),
      scss: generateLoaders([ 'css-loader', 'postcss-loader', 'sass-loader' ]),
      sass: generateLoaders([ 'css-loader', 'postcss-loader', 'sass-loader' ])
    };
  };

  loader.styleLoaders = function(options) {
    const output = [];
    const loaders = this.cssLoaders(options);
    for (const extension in loaders) {
      const loader = loaders[extension];
      output.push({
        test: new RegExp('\\.' + extension + '$'),
        loader
      });
    }
    return output;
  };

  return loader;

};
