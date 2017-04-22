'use strict';

exports.build = require('./build/lib/build');
exports.loader = require('./build/lib/loader');
exports.utils = require('./build/lib/utils');
exports.entry = require('./build/lib/entry');
exports.create = require('./build/lib/create');
exports.baseConfig = require('./build/webpack.base.conf');
exports.clientConfig = require('./build/webpack.client.conf');
exports.clientDevConfig = require('./build/webpack.client.dev.conf');
exports.clientTestConfig = require('./build/webpack.client.test.conf');
exports.clientProdConfig = require('./build/webpack.client.prod.conf');
exports.serverConfig = require('./build/webpack.server.conf');
exports.serverDevDevConfig = require('./build/webpack.server.dev.conf');
exports.serverTestTestConfig = require('./build/webpack.server.test.conf');
exports.serverProdConfig = require('./build/webpack.server.prod.conf');
