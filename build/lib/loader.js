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
    // generate loader string to be used with extract text plugin
    function generateLoaders(loaders) {
      const sourceLoader = loaders.map(function(loader) {
        let extraParamChar;
        if (/\?/.test(loader)) {
          loader = loader.replace(/\?/, '-loader?');
          extraParamChar = '&';
        } else {
          loader = loader + '-loader';
          extraParamChar = '?';
        }
        return loader + (options.sourceMap ? extraParamChar + 'sourceMap' : '');
      }).join('!');

      if (options.extract) {
        return ExtractTextPlugin.extract({
          fallback: 'vue-style-loader',
          use: sourceLoader
        });
      }
      return [ 'vue-style-loader', sourceLoader ].join('!');

    }

    // http://vuejs.github.io/vue-loader/configurations/extract-css.html
    return {
      css: generateLoaders([ 'css?-autoprefixer', 'postcss' ]),
      postcss: generateLoaders([ 'css?-autoprefixer', 'postcss' ]),
      less: generateLoaders([ 'css?-autoprefixer', 'postcss', 'less' ]),
      sass: generateLoaders([ 'css?-autoprefixer', 'postcss', 'sass?indentedSyntax' ]),
      scss: generateLoaders([ 'css?-autoprefixer', 'postcss', 'sass' ]),
      stylus: generateLoaders([ 'css?-autoprefixer', 'postcss', 'stylus' ]),
      styl: generateLoaders([ 'css?-autoprefixer', 'postcss', 'stylus' ])
    };
  };

  // Generate loaders for standalone style files (outside of .vue)
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
