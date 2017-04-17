var path = require('path');
var webpack = require('webpack');
var path = require('path');

var config = {
  devtool: 'source-map',
  entry: [
    path.resolve(__dirname, './src/index.js')
  ],
  resolve: { 
    extensions: ['.js', '.jsx'],
    alias:{
       _containers: path.resolve( __dirname, './src/containers/' ),
       _actions: path.resolve( __dirname, './src/actions/' ),
       _components:  path.resolve( __dirname, './src/components/' )
    }
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    publicPath: '/dist/'
  },
  plugins: [
    new webpack.DefinePlugin({
      '__DEVTOOLS__': false,
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: false,
      output: {
          comments: false
      },
      compress:{
        warnings: true,
        'unused'    : true,
        'dead_code' : true
      }
    })
  ],
  module: {
    loaders: [
          {
              test: /\.js$/,
              loader: "babel-loader",
              query: {
                presets: [ "es2015", "react", "stage-1" ]
              },
              exclude: /node_modules/,
          }
      ]
  }
};

module.exports = config;
