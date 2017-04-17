var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

// Compiller
var webpack              = require("webpack");
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

var Wconfig   = null;
var compiler  = null;
Wconfig   = require("./webpack.config.dev");
compiler  = webpack(Wconfig);
app.use(webpackDevMiddleware(compiler, {
  compress: true,
  hot: true,
  inline: true,
  stats: {
    colors: true,
    hash: true,
    timings: true,
    chunks: false
  }
}));
app.use(webpackHotMiddleware(compiler));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Request-Headers", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

var staticPath = __dirname + "/";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(staticPath));
app.use('/', express.static(staticPath));

module.exports = app;
