# egg-vue-webpack-dev

基于egg + vue2 + webpack2 的前后端集成开发打包插件, 支持服务器端和客户端jsbundle构建. 项目使用时, 建议结合 `egg-view-vue和egg-view-vue-ssr` 插件一起使用.

**NOTE: egg-vue-webpack-dev 插件已经分离为easywebpack, egg-webpack, egg-webpack-vue 插件, 保证功能单一, 可以扩展更多基于webpack的打包方案, 比如vue, react, weex. 新版解决方案见[egg-vue-webpack-boilerplate](https://github.com/hubcarl/egg-vue-webpack-boilerplate)**


## 特性

- 支持vue单页面/多页面入口服务器端和客户端分别构建, 支持服务器渲染和前端客户端渲染两种模式.
- 集成koa-webpack-dev-middleware和koa-webpack-hot-middleware中间件, 支持开发热更新和自动刷新, 开发时构建的目标文件存储到内存里面, 资源访问时直接从内存里面读取.
- 内置本地开发, 测试环境, 正式环境默认配置, 可以基于默认配置进行扩展, 简化webpack配置的复杂性.
- 插件已内置webpack基本配置, 可以自定义webpack配置覆盖已有配置.
- 当结合`egg-view-vue-ssr` 插件一起使用, 本地开发时, 文件读取会改为从webpack编译的内存读取.
- 通过require('egg-vue-webpack-dev')方式可以获取插件内部默认配置方便进行自定义实现打包插件.

## 安装

```bash
npm i egg-vue-webpack-dev --save-dev
```


## 插件配置


#### 插件内置配置如下:

```javascript
// egg-vue-webpack-dev/config/config.default.js
exports.vuewebpackdev = {
  build: {
    port: 8888, // 开发时webpack 内部启动构建服务端口, 这个端与应用启动的端口是两回事.
    path: 'public', // webpack构建的文件生产到项目中的指定目录,
    staticDir: 'static', // webpack构建静态资源目录,
    publicPath: '/public/', // 静态资源访问的路径前缀
    entryDir: 'app/web/page', // webpack构建etnry 的目录, 会递归遍历该目录所有文件,生产entry入口文件(多页面)
    //globalLayout: 'app/web/view/layout/layout.html', // 全局html模板 ,默认关闭
    //customLayout: 'layout.html', // 单个entry文件的html模板, 默认关闭
    //commonsChunk:['vendor'],  // 生成公共库js/css的名字
    //自定义配置与会与默认配置进行merge操作
    webpackClientDevConfig: 'build/webpack.client.dev.conf.js',  // 自定义本地前端打包开发配置
    webpackClientTestConfig: 'build/webpack.client.test.conf.js', // 自定义前端打包测试环境开发配置
    webpackClientProdConfig: 'build/webpack.client.prod.conf.js', // 自定义前端打包正式环境开发配置
    webpackServerDevConfig: 'build/webpack.server.dev.conf.js',   // 自定义服务器打包本地开发配置
    webpackServerTestConfig: 'build/webpack.server.test.conf.js', // 自定义服务器打包测试开发配置
    webpackServerProdConfig: 'build/webpack.server.prod.conf.js'  // 自定义服务器打包测试开发配置
  },
  // webpack: { // loader options
  //  loaderOption: {
  //    sass: {
  //      includePaths: [path.join(app.baseDir, 'app/web/asset/style')]
  //    }
  //  }
  // },
  env: {
    dev: {
      uglifyJs: false  // 打包时, js是否压缩, 开发默认不压缩
    },
    test: {
      uglifyJs: true  // 打包时, 测试环境js是否压缩, 默认压缩
    },
    prod: {
      uglifyJs: true // 打包时, 正式环境js是否压缩, 默认压缩
    }
  }
};
```


#### 插件运行自定义config配置如下:

```javascript
// {app_root}/config/config.local.js
exports.vuewebpackdev = {
		build: {
		  // 生成公共库js/css的名字
			commonsChunk: ['vendor'],
		},
		env: {
			dev: {
				uglifyJs: true,
				uglifyJsConfig: {
					compress: {
						drop_console: true,
						drop_debugger: true
					}
				}
			}
		}
};
```



## 编译打包

#### 1.在项目build目录下面加入build.js, 然后加入如下内容:

```javascript

const path = require('path');
const projectRoot = path.resolve(__dirname, '..');
const localConfigPath = path.join(projectRoot, 'config/config.local.js');
const buildConfig = require(localConfigPath)({}).vuewebpackdev;
const env = process.env.BUILD_ENV || 'prod';
const tool = require('egg-vue-webpack-dev');
tool.build(projectRoot, env, buildConfig);

```

#### 2.在package.json 文件加入如下配置:

```bash
"scripts": {
  "build-dev": "node build/build.js -- dev",
  "build-test": "node build/build.js -- test",
  "build-prod": "node build/build.js -- prod"
}
```

#### 3.编译结果说明

- 服务器构建结果默认会编译到 `path.join(app.baseDir, 'app/view')`

- 客户端构建结构默认会编译到 `path.join(vuewebpackdev.build.path, vuewebpackdev.build.static)`

- manifest资源依赖构建到 `path.join(app.baseDir, 'config/manifest.json')`

```js
{
  "/about/about.css": "/static/css/about/about.css",
  "/about/about.js": "/static/js/about/about.js",
  "/app/app.css": "/static/css/app/app.css",
  "/app/app.js": "/static/js/app/app.js",
  "/element/element.css": "/static/css/element/element.css",
  "/element/element.js": "/static/js/element/element.js",
  "/index/index.css": "/static/css/index/index.css",
  "/index/index.js": "/static/js/index/index.js",
  "/router/router.css": "/static/css/router/router.css",
  "/router/router.js": "/static/js/router/router.js",
  "/static/img/loading.gif": "/static/img/loading.0c81ad1.gif",
  "/test/test.css": "/static/css/test/test.css",
  "/test/test.js": "/static/js/test/test.js",
  "/vendor.css": "/static/css/vendor.css",
  "/vendor.js": "/static/js/vendor.js"
}
```

- 编译信息构建到 `path.join(app.baseDir, 'config/buildConfig.json')`

```js

{
  "publicPath":  "/public/", // 资源访问前缀
  "commonsChunk": ["vendor"] // 生成公共库js/css的名字
}

```


默认资源访问路径:

```html
<link rel="stylesheet" href="/public/static/css/vendor.3467a89.css">
<link rel="stylesheet" href="/public/static/css/home/home.7aa5d4b.css">

<script type="text/javascript" src="/public/static/js/vendor.46747b9.js"></script>
<script type="text/javascript" src="/public/static/js/home.63a84eb.js"></script>
```


可以在自定义 `${app_root}/build/webpack.client.prod.conf.js` 配置cdn前地址

```js
const webpackConfig = {
  output: {
    publicPath: '//cdn/app/prod'
  }
}
```

最终资源访问路径:

```html
<link rel="stylesheet" href="//cdn/app/prod/public/static/css/vendor.3467a89.css">
<link rel="stylesheet" href="//cdn/app/prod/public/static/css/home/home.7aa5d4b.css">

<script type="text/javascript" src="//cdn/app/prod/public/static/js/vendor.46747b9.js"></script>
<script type="text/javascript" src="//cdn/app/prod/public/static/js/home.63a84eb.js"></script>

```

#### 4.进入项目根目录, 命令行运行对应环境的命令, 就能编译出对应的构建文件.

- 开发模式

```bash
npm run build-dev
```

- 测试环境

```bash
npm run build-test
```

- 正式环境

```bash
npm run build-prod
```

## 本地开发

- 在package.json 文件加入如下相应运行的快捷方式:

```bash
"scripts": {
  "build-dev": "node build/build.js -- dev",
  "build-test": "node build/build.js -- test",
  "build-prod": "node build/build.js -- prod",
  "start": "node index.js",
  "start-test": "npm run build-test && NODE_ENV=prodcution BUILD_ENV=test node index.js",
  "start-prod": "npm run build-prod && NODE_ENV=prodcution BUILD_ENV=prod node index.js"
}
```

- 运行npm start 进入egg项目启动和webpack构建流程

```bash
npm start
```

- npm start运行和webpack构建效果如下

图片中有两个build的任务: build server bundle 和 build client bundle.  其中server bundle 是服务器渲染使用,  client bundle 是客户端渲染使用.

![webpack运行](https://github.com/hubcarl/egg-vue-webpack-dev/blob/master/doc/webpack.png)

访问:http://127.0.0.1:7001

## 工程项目骨架

[egg-vue-webpack-boilerplate](https://github.com/hubcarl/egg-vue-webpack-boilerplate)
