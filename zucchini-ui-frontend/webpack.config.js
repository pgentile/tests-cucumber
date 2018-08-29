/* eslint-disable */

const path = require("path");
const webpack = require("webpack");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

// Output dir
const outputDir = path.join(__dirname, "build/dist/assets");

// Config
const config = require("./config.json");

module.exports = {
  entry: [
    "./src/main.js",
    "./src/styles/main.less",
    "bootstrap/dist/css/bootstrap.css",
    "chartist/dist/chartist.min.css"
  ],
  resolve: {
    modules: [path.join(__dirname, "src"), "node_modules"],
    extensions: [".js", ".jsx", ".less", ".css"]
  },
  output: {
    path: outputDir,
    filename: "[name].js",
    publicPath: "/"
  },
  devtool: "source-map",
  devServer: {
    port: config.devServer.port,
    publicPath: "/ui/assets",
    before: function(app) {
      app.get("/ui/assets/config.js", (req, res) => {
        // Connect function to serve a Javascript configuration file
        res.writeHead(200, { "Content-Type": "application/javascript" });
        res.end(`var configuration = ${JSON.stringify(config.ui)};`);
      });
    }
  },
  externals: {
    configuration: "configuration"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: ["eslint-loader"]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader?cacheDirectory"]
      },
      {
        // Modules distributed as to transpile with Babel
        test: /\.jsx?$/,
        include: /node_modules[/\\](query-string|strict-uri-encode)/,
        use: ["babel-loader?cacheDirectory"]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader?sourceMap", "postcss-loader?sourceMap"]
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, "css-loader?sourceMap", "postcss-loader?sourceMap", "less-loader?sourceMap"]
      },
      {
        test: /\.(ttf|eot|woff2?|svg|png|jpg|gif)$/,
        use: ["url-loader?limit=100000"]
      }
    ]
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: "vendor",
          chunks: "all",
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          name: "main",
          chunks: "all",
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    // fetch as standard API
    new webpack.ProvidePlugin({
      fetch: "isomorphic-fetch"
    }),

    new MiniCssExtractPlugin(),

    // Don't import all locales from moment.js
    // See https://webpack.js.org/plugins/context-replacement-plugin/
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /fr\.js/),

    // Replace lodash-es imports by equivalent lodash imports.
    // Otherwise, same lodash functions can be loaded twice !
    new webpack.NormalModuleReplacementPlugin(/lodash-es/, resource => {
      resource.request = resource.request.replace("lodash-es", "lodash");
    })
  ]
};
