// @ts-check
/**
 * @fileoverview 为 tea-app 提供开发环境服务
 */

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const colors = require('colors');
const prettyBytes = require('pretty-bytes');
const middleware = require('webpack-dev-middleware');
const config = require('./webpack/webpack-config');
const readPackage = require('../lib/read-package');

// 为指定的 app 路径启动开发服务器
const start = async (appPath, lng) => {
  // 从 package.json 获得包信息
  let appPackage = readPackage(appPath);

  // 从包名析构 app 名称
  const packageName = appPackage.name;
  if (!/^@tencent\/tea-app-(.+)$/.test(packageName)) {
    throw new Error('指向的 package.json 貌似不是一个 Tea 应用: ' + packageName);
  }
  const appName = RegExp.$1;

  // wds 所用端口，暂时约定 8322（Tea Web Dev Server 的九宫格位置）
  const port = 8322;

  // 利用配置生成 WebPack 编译器
  const compiler = webpack(config({
    env: 'development',
    appName,
    appPath,
    lng,
  }));

  // 创建 webpack 开发中间件
  const wdm = middleware(compiler, {
    publicPath: '/',
    stats: "minimal",
    // 自定义报告的实现，提供尽量简洁又重要的信息
    reporter(options, { stats }) {
      // 单次编译完成，会提供 stats 作为编译结果汇报
      if (stats) {
        // 输出编译错误
        if (stats.hasErrors()) {
          console.log('[tea-wds] %s', colors.bold.red(stats.toString(options.stats)));
        }
        // 输出编译告警
        else if (stats.hasWarnings()) {
          console.log('[tea-wds] %s', colors.yellow(stats.toString(options.stats)));
        }
        // 输出编译汇报，如：
        // [tea-wds] http://127.0.0.1:8322/cvm.js (70.8 kB) +56ms
        else {
          const { time, assets: [asset] } = stats.toJson();
          console.log(
            '[tea-wds] %s (%s) %s',
            colors.bold.green(`http://127.0.0.1:${port}/${asset.name}`),
            colors.cyan(prettyBytes(asset.size)),
            colors.gray(`+${time}ms`)
          );
        }
      }
      // 重新编译会触发此分支
      else {
        console.log('[tea-wds] %s', colors.grey('Compiling...'));
      }
    }
  });
  
  // 使用 express 创建 server
  const app = express().use(wdm).listen(port);

  // 好了，可以启动
  console.log('[tea-wds] %s', colors.grey(`Starting up (lang: ${lng || 'zh'}) ...`));
};

// 直接启动的，从参数获取启动路径
// @ts-ignore
if (module === require.main) {
  let appPath = process.argv[2];
  let lng = process.argv[3];
  if (!appPath) {
    console.log('Usage: node wds [appPath]');
    process.exit(0);
  }
  if (!path.isAbsolute(appPath)) {
    appPath = path.join(process.cwd(), appPath);
  }
  start(appPath, lng);
}
// 被引用的情况下，导出 start 方法
else {
  module.exports = { start };
}