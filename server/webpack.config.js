var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path')
module.exports = {
  devtool: debug ? "inline-sourcemap" : null,
  entry: path.join(__dirname + "./../client/client.js"),
  output: {
    path: path.join(__dirname + "./../client"),
    filename: "scripts.min.js"
  },
  plugins: debug ? [] : [
    //new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};

