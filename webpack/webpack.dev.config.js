var webpack = require('webpack');
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 打包前清除遗留文件 插件
const CleanWebpackPlugin = require('clean-webpack-plugin');
var webpackCommon = require('./webpack.common');

module.exports = {
  mode: 'development',
  "target": "node",
  devtool: 'source-map', //'source-map', 调试时需要开启
  entry: {
    //开发时入口
    'app':path.resolve(__dirname,'../src/App.jsx')
  },
  output: {
    filename: '[name].js',
    chunkFilename:'[name].buildChunk.js',
    path: path.resolve(__dirname, '../dist')
   // publicPath : path.resolve(__dirname, '..'),
  },
  plugins: [
    // 该插件用法 http://webxiaoma.com//webpack/处理目录文件.html
    new HtmlWebpackPlugin({
      inject: true, 
      template: path.resolve(__dirname,'../index.html'),
     }),
     new CleanWebpackPlugin(['dist']),
  ],
  module: webpackCommon.module,
  resolve: webpackCommon.resolve,
  externals: webpackCommon.externals
};
