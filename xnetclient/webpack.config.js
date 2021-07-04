var path = require("path");
let fs = require("fs");
// function entries() {
//   var jsDir = path.resolve(__dirname, "src/.generated");
//   var map = {};
//   const dirs = fs.readdirSync(jsDir);

//   dirs.forEach(dir => {
//     const p = path.resolve(jsDir, dir);
//     const st = fs.statSync(p);
//     if (st.isDirectory()) {
//       map[dir] = path.resolve(p, "index.ts");
//     }
//   });

//   return map;
// }
module.exports = {
  devtool: 'source-map',
  target: "node",
  // entry: entries(),
  // output: {
  //   path: path.resolve(__dirname, "dist"),
  //   filename: "[name].js",
  //   chunkFilename: "chunk.js"
  // },
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    libraryTarget: "umd",
    library: "@jtl/xnetclient"
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  mode: "production",
  plugins: [],
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{
        loader: "babel-loader",
        options: {
          cacheDirectory: true
        }
      },
      {
        loader: "awesome-typescript-loader",
        query: {
          declaration: false
        }
      }
      ]
    }]
  },
  externals: {
    "@jtl/qmath": "@jtl/qmath",
    "axios": "axios",
    "bluebird": "bluebird",
    "inversify": "inversify",
    "moment": "moment",
    "lodash": {
      commonjs: "lodash",//如果我们的库运行在Node.js环境中，import _ from 'lodash'等价于const _ = require('lodash')
      commonjs2: "lodash",//同上
      amd: "lodash",//如果我们的库使用require.js等加载,等价于 define(["lodash"], factory);
      root: "_"//如果我们的库在浏览器中使用，需要提供一个全局的变量‘_’，等价于 var _ = (window._) or (_);
    }
  }
};