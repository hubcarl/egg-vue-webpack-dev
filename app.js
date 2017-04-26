'use strict';
const path = require('path');
const fs = require('fs');
const Constant = require('./lib/constant');

module.exports = app => {

  if (app.view) {
    app.view.resolve = function* (name) {
      return name;
    };
  }
  if (app.vue) {
    app.vue.readFile = fileName => {
      const filePath = path.isAbsolute(fileName) ? fileName : path.join(app.config.view.root[0], fileName);
      if (/\.html$/.test(fileName)) {
        return new Promise(resolve => {
          app.messenger.sendToAgent(Constant.EVENT_WEBPACK_READ_CLIENT_FILE_MEMORY, {
            filePath,
            fileName,
          });
          app.messenger.on(Constant.EVENT_WEBPACK_READ_CLIENT_FILE_MEMORY_CONTENT, data => {
            resolve(data.fileContent);
          });
        });
      }
      return new Promise(resolve => {
        app.messenger.sendToAgent(Constant.EVENT_WEBPACK_READ_SERVER_FILE_MEMORY, {
          filePath,
          fileName,
        });
        app.messenger.on(Constant.EVENT_WEBPACK_READ_SERVER_FILE_MEMORY_CONTENT, data => {
          resolve(data.fileContent);
        });
      });
    };
  }

  app.use(function* (next) {

    if (app.webpack_server_build_success && app.webpack_client_build_success) {
      yield* next;
    } else {
      const serverData = yield new Promise(resolve => {
        this.app.messenger.sendToAgent(Constant.EVENT_WEBPACK_SERVER_BUILD_STATE, {
          webpackBuildCheck: true,
        });
        this.app.messenger.on(Constant.EVENT_WEBPACK_SERVER_BUILD_STATE, data => {
          resolve(data);
        });
      });
      app.webpack_server_build_success = serverData.state;

      const clientData = yield new Promise(resolve => {
        this.app.messenger.sendToAgent(Constant.EVENT_WEBPACK_CLIENT_BUILD_STATE, {
          webpackBuildCheck: true,
        });
        this.app.messenger.on(Constant.EVENT_WEBPACK_CLIENT_BUILD_STATE, data => {
          resolve(data);
        });
      });

      app.webpack_client_build_success = clientData.state;

      if (!(app.webpack_server_build_success && app.webpack_client_build_success)) {
        if (app.webpack_loading_text) {
          this.body = app.webpack_loading_text;
        } else {
          const filePath = path.resolve(__dirname, './build/template/loading.html');
          this.body = app.webpack_loading_text = fs.readFileSync(filePath, 'utf8');
        }
      } else {
        yield* next;
      }
    }
  });

  app.messenger.on(Constant.EVENT_WEBPACK_SERVER_BUILD_STATE, data => {
    app.webpack_server_build_success = data.state;
  });

  app.messenger.on(Constant.EVENT_WEBPACK_CLIENT_BUILD_STATE, data => {
    app.webpack_client_build_success = data.state;
  });
};
