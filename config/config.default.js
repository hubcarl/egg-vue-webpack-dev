'use strict';

module.exports = () => {
  const exports = {};

  exports.vuewebpackdev = {
    build: {
      port: 8888, // 开发时webpack 内部启动构建服务端口, 这个端与应用启动的端口是两回事.
      path: 'public', // webpack构编译到项目中的根目录,
      staticDir: 'static', // webpack构建静态资源目录,基于path根目录
      publicPath: '/public/', // 静态资源访问的路径前缀
      entryDir: 'app/web/page', // webpack构建etnry 的目录, 会递归遍历该目录所有文件, 生产entry入口文件
      // globalLayout: 'app/web/view/layout/layout.html', // 全局html模板 ,默认关闭
      // customLayout: 'layout.html', // 单个entry文件的html模板, 默认关闭
      // commonsChunk:['vendor'],  // 生成公共库js/css的名字
      sourceMap: false,
      webpackClientDevConfig: 'build/webpack.client.dev.conf.js',
      webpackClientTestConfig: 'build/webpack.client.test.conf.js',
      webpackClientProdConfig: 'build/webpack.client.prod.conf.js',
      webpackServerDevConfig: 'build/webpack.server.dev.conf.js',
      webpackServerTestConfig: 'build/webpack.server.test.conf.js',
      webpackServerProdConfig: 'build/webpack.server.prod.conf.js',
    },
    // webpack: { // loader options
    //  loaderOption: {
    //    sass: {
    //      includePaths: [path.resolve(__dirname, '../app/web/asset/style')]
    //    }
    //  }
    // },
    env: {
      dev: {
        uglifyJs: false,
      },
      test: {
        uglifyJs: true,
      },
      prod: {
        uglifyJs: true,
      },
    },
  };

  return exports;
};
