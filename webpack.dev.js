const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
      static: './',
      host:'localhost'
  },
  output: {
    filename: '[name].bundle.js',
  },
  plugins: [
  ]
});