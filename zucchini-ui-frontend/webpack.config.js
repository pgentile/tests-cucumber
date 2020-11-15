const path = require("path");
const { NormalModuleReplacementPlugin } = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

// Output dir
const outputDir = path.join(__dirname, "build/dist/assets");

// Config
const devServerPort = parseInt(process.env.DEV_SERVER_PORT || 9000);
const apiUrl = process.env.API_URL || "http://localhost:8080";

const publicPath = "/ui/assets/";

module.exports = (env, argv) => {
  const mode = argv.mode || "development";
  return {
    // Bug ? Webpack 5.1.3 : argument mode en ligne de commande pas pris en compte
    mode,
    entry: {
      main: "./src/main.jsx"
    },
    resolve: {
      extensions: [".js", ".jsx", ".scss", ".css"]
    },
    output: {
      path: outputDir,
      filename: "[name].js",
      publicPath
    },
    devtool: "source-map",
    optimization: {
      minimizer: ["...", new CssMinimizerPlugin()]
    },
    devServer: {
      host: "0.0.0.0",
      port: devServerPort,
      publicPath,
      historyApiFallback: true,
      contentBase: path.join(__dirname, "public"),
      before: (app) => {
        app.get(/serviceWorker.*\.js$/, (req, res, next) => {
          res.append("Service-Worker-Allowed", "/ui/");
          next();
        });

        app.get("/", (req, res) => {
          res.redirect("/ui/");
        });
      },
      proxy: {
        "/api": {
          target: apiUrl
        },
        "/ws": {
          target: apiUrl.replace(/^http/, "ws"),
          ws: true
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          include: [path.join(__dirname, "src"), path.join(__dirname, "node_modules", "quick-lru")],
          use: [
            {
              loader: "babel-loader",
              options: {
                envName: mode
              }
            }
          ]
        },
        {
          test: /\.s?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
                importLoaders: 2
              }
            },
            "postcss-loader?sourceMap",
            "sass-loader?sourceMap"
          ]
        },
        {
          test: /\.(ttf|eot|woff2?|svg|png|jpg|gif)$/,
          type: "asset"
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),

      new MiniCssExtractPlugin(),

      // Replace lodash-es imports by equivalent lodash imports.
      // Otherwise, same lodash functions can be loaded twice !
      new NormalModuleReplacementPlugin(/lodash-es/, (resource) => {
        resource.request = resource.request.replace("lodash-es", "lodash");
      }),

      new ESLintPlugin({
        resolvePluginsRelativeTo: __dirname
      })
    ]
  };
};
