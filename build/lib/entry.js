'use strict';
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const entry = {};
const serverEntry = {};
const entryHtmlConfig = [];

module.exports = (projectRoot, config) => {
  const currentBuildEnv = config.build.env;
  const serverBundleExclude = config.env[currentBuildEnv] && config.env[currentBuildEnv].serverBundleExclude;
  const entryDir = path.join(projectRoot, config.build.entryDir);
  const walk = dir => {
    const dirList = fs.readdirSync(dir);
    dirList.forEach(function(item) {
      const filePath = path.join(dir, item);
      if (!utils.isMatch(serverBundleExclude, filePath)) {
        if (fs.statSync(filePath).isDirectory()) {
          walk(filePath);
        } else {
          if (/\.js$/.test(filePath)) {
            const fileName = filePath.replace(entryDir, '').replace(/^\//, '').replace(/\.js$/, '');
            entry[fileName] = filePath;

            if (config.build.globalLayout || config.build.customLayout) {
              let template = path.join(projectRoot, config.build.globalLayout);
              const templateFilePath = path.join(path.dirname(filePath), config.build.customLayout);
              if (fs.existsSync(templateFilePath)) {
                template = templateFilePath;
              }
              entryHtmlConfig.push({
                filename: fileName,
                template,
              });
            }
          }
        }
      }
    });
  };
  walk(entryDir);
  return {
    entry,
    serverEntry,
    htmlConfig: entryHtmlConfig,
  };
};
