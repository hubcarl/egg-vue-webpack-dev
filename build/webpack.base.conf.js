'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = (projectRoot, config, options = {}) => {
  const loader = require('./lib/loader')(projectRoot, config);
  const baseWebpackConfig = {
    output: {
      path: path.join(projectRoot, config.build.path),
      publicPath: config.build.publicPath,
      filename: '[name].js',
    },
    resolve: {
      extensions: [ '.js', '.vue' ],
    },

    module: {
      rules: [{
        test: /\.vue$/,
        loader: require.resolve('vue-loader'),
        options: loader.loadVueOption({
          extract: options.extract,
        }),
      }, {
        test: /\.(js)$/,
        loader: require.resolve('babel-loader'),
        exclude: /node_modules/,
        include: projectRoot,
      }, {
        test: /\.json$/,
        loader: require.resolve('json-loader'),
      }, {
        test: /\.html$/,
        loader: require.resolve('vue-html-loader'),
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: require.resolve('url-loader'),
        query: {
          limit: 1024,
          name: loader.assetsPath('img/[name].[hash:7].[ext]'),
        },
      }, {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: require.resolve('url-loader'),
        query: {
          limit: 1024,
          name: loader.assetsPath('fonts/[name].[hash:7].[ext]'),
        },
      }],
    },

    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),
    ],
  };
  return baseWebpackConfig;
};
