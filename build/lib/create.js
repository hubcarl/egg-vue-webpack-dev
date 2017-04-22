'use strict';
const fs = require('fs');
const path = require('path');
const serverEntry = {};
const CHARSET = 'utf-8';
const utils = require('./utils');

module.exports = (projectRoot, config) => {
  if (config.build.server) {
    const entryDir = path.join(projectRoot, config.build.entryDir);
    const fileServerTemplate = path.resolve(__dirname, '../template/server.js');
    const serverTemplate = fs.readFileSync(fileServerTemplate, CHARSET);
    const walk = dir => {
      const dirList = fs.readdirSync(dir);
      dirList.forEach(item => {
        const filePath = path.join(dir, item);
        if (!utils.isMatch(config.build.serverBundleExclude, filePath)) {
          if (fs.statSync(filePath).isDirectory()) {
            walk(filePath);
          } else {
            const fileDir = path.dirname(filePath);
            const basename = path.basename(filePath).replace(/\.js$/, '');
            // 目录与文件同名
            if (/\.js$/.test(filePath) && fileDir.endsWith(basename)) {
              const serverFile = path.join(fileDir, 'server.js');
              try {
                fs.statSync(serverFile);
              } catch (e) {
                fs.writeFileSync(serverFile, serverTemplate.replace('{App}', basename));
                const fileName = filePath.replace(entryDir, '').replace(/^\//, '').replace(/\.js$/, '');
                serverEntry[fileName] = serverFile;
              }
            }
          }
        }
      });
    };
    walk(entryDir);
  }
  return serverEntry;
};
