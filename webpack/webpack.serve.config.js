/**
npm 启动方式：
"start": "npx webpack-serve"
**/

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// 打包前清除遗留文件 插件
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack')

module.exports = {
    context: path.resolve(__dirname),
    mode: 'none',
    entry:{
        'pageOne':path.resolve(__dirname, '../src/pageOne.js'),
        'pageTwo':path.resolve(__dirname, '../src/PageTwo.js'),
     },
    output: {
        filename: '[name].[hash:4].js',
        chunkFilename:'[name].buildChunk.js',
        path: path.resolve(__dirname, '../dist')
    },
    module: {
        rules: [
            {
               test: /\.js$/,
               use: ['babel-loader'],
               exclude: /(node_modules)/
            }
        ]
    },
    optimization:{
        splitChunks:{
           chunks:'all',
           minSize:100, //(默认是30000)：形成一个新代码块最小的体积
          
        }
    },
    plugins:[
        // 该插件用法 http://webxiaoma.com//webpack/处理目录文件.html
        new HtmlWebpackPlugin({
           inject: true, 
           template:path.resolve(__dirname, '../index.html') ,
       }),
       new CleanWebpackPlugin(['dist']),

    ]
   
};
