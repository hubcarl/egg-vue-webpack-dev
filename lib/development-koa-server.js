'use strict';

const webpack = require('webpack');
const koa = require('koa');
const cors = require('kcors');
const app = koa();
app.use(cors());
const Constant = require('./constant');
const Utils = require('../build/lib/utils');

module.exports = agent => {

  const projectDir = agent.baseDir;
  const config = agent.config.vuewebpackdev;

  const env = process.env.EGG_SERVER_ENV || 'dev';
  const serverWebpackConfig = require(`../build/webpack.server.${env}.conf`)(projectDir, config);

  const compiler = webpack([ serverWebpackConfig ]);

  compiler.plugin('done', () => {
    agent.messenger.sendToApp(Constant.EVENT_WEBPACK_SERVER_BUILD_STATE, { state: true });
    agent.webpack_server_build_success = true;
  });

	// agent.messenger.on('reload-worker', () => {
	//  console.log('------------------worker----------------------');
	//  agent.messenger.sendToApp('webpack_server_build_success');
	// });

  const devMiddleware = require('koa-webpack-dev-middleware')(compiler, {
    publicPath: serverWebpackConfig.output.publicPath,
    stats: {
      colors: true,
      children: true,
      modules: false,
      chunks: false,
      chunkModules: false
    },
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 2000,
      poll: true
    }
  });

	// const hotMiddleware = require('koa-webpack-hot-middleware')(compiler, {
	//  dynamicPublicPath: true,
	//  path: webpackConfig.output.publicPath,
	//  log: false,
	//  reload: true
	// });

  app.use(devMiddleware);
	// app.use(hotMiddleware);

  app.listen(config.build.port + 1, err => {
    if (!err) {
      agent.logger.info(`start webpack server build service: ${Utils.getHost(config, 2, true)}`);
    }
  });

  agent.messenger.on(Constant.EVENT_WEBPACK_SERVER_BUILD_STATE, () => {
    agent.messenger.sendToApp(Constant.EVENT_WEBPACK_SERVER_BUILD_STATE, { state: agent.webpack_server_build_success });
  });

  agent.messenger.on(Constant.EVENT_WEBPACK_READ_SERVER_FILE_MEMORY, data => {
    const fileContent = Utils.readWebpackMemoryFile(compiler, data.filePath);
    if (fileContent) {
      agent.messenger.sendToApp(Constant.EVENT_WEBPACK_READ_SERVER_FILE_MEMORY_CONTENT, {
        fileContent
      });
    } else {
      agent.logger.error(`webpack server memory file[${data.filePath}] not exist!`);
      agent.messenger.sendToApp(Constant.EVENT_WEBPACK_READ_SERVER_FILE_MEMORY_CONTENT, {
        fileContent: ''
      });
    }
  });
};
