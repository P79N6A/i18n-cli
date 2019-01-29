const path = require('path');
module.exports = {
  module: {
    rules: [{
        test: /\.(tsx|ts)$/,
        use: ['babel-loader', 'ts-loader'],
        exclude: [/node_modules/]
      },
      {
        test: /\.(jsx|js)$/,
        loader: ['babel-loader'],
        exclude: [/node_modules/]
       
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|otf|svg)$/i,
        loader: 'url-loader?limit=8192'
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts']
  },
  externals: {
    'babel-polyfill': 'null'
  }
};