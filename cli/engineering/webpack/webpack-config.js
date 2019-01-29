// @ts-check
const path = require("path");
const webpack = require("webpack");
const aliasFromJsConfig = require("./alias-from-jsconfig");

/**
 * 为指定的 tea app 提供默认构建配置
 * @returns {import('webpack').Configuration}
 */
function config({ env, appName, appPath, lng }) {
  // 开发模式和生产环境配置有很大差异
  const devmode = env === "development";
  return {
    mode: env,
    resolveLoader: {
      modules: [
        // 从 tea-cli 的 node_modules 里找 loader
        // 项目目录是不安装的
        path.resolve(__dirname, '..', '..', 'node_modules'),
      ]
    },
    entry: {
      // APP 入口，约定为项目根目录的 app.js
      [appName]: path.join(appPath, "src", "app.js")
    },
    output: {
      // 构建位置，约定为项目目录下的 dist 目录
      path: path.join(appPath, "dist"),
      // 生成文件名默认为 app 名字，生产环境添加 10 位哈希值
      filename: devmode ? "[name].js" : "[name].[chunkhash:10].js",
      // 约定最终部署到 CDN 的位置
      publicPath: `https://imgcache.qq.com/qcloud/tea/app/`
    },
    module: {
      // 现在的 babel 配置已经很简单了，我们只需要加入默认的配置即可
      rules: [
        {
          test: /\.jsx?/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [require("@babel/preset-env"), require("@babel/preset-react")]
            }
          }
        }
      ]
    },
    // 开发环境，为了不纠结路径问题，使用 inline-source-map
    // 正式环境，要生成 source-map 文件，用于异常监控
    // devtool: devmode ? "inline-source-map" : "source-map",
    devtool: 'nosources-source-map',
    plugins: [
      // 编译错误不输出
      new webpack.NoEmitOnErrorsPlugin(),
      // 定义环境变量
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": `"${env}"`
      })
    ],
    resolve: {
      // 添加 jsx 后缀支持
      extensions: [".js", ".jsx"],
      // 添加工程目录下的 src 目录作为模块目录，可以支持模块间基于 src 进行引用
      modules: [
        path.join(appPath, 'src'),
        'node_modules',
      ],
      alias: {
        // react 和 react-dom 控制台通过全局变量提供，我们不打包
        "react": path.resolve(__dirname, './alias/react.js'),
        "react-dom": path.resolve(__dirname, './alias/react-dom.js'),

        // 国际化语言包覆盖
        "@i18n/translation": path.resolve(appPath, `./i18n/translation/${lng || 'zh'}.js`),
        
        // 从 js-config 中读取 path-mapping 配置，webpack 通过 alias 支持
        ...aliasFromJsConfig(appPath),
        
      },
      // 支持开发时 npm link 的用法
      symlinks: true
    },
    externals: {
      "__react-global": "window.React16",
      "__react-dom-global": "window.ReactDOM16"
    }
  };
}

module.exports = config;
