const HtmlBundlerPlugin = require("html-bundler-webpack-plugin");
const { resolve } = require("path");

module.exports = {
  createWebpackConfig,
};

/**
 * @param {string} fixture
 * @returns {import('webpack').Configuration}
 */
function createWebpackConfig(fixture) {
  return {
    mode: "production",
    devtool: "source-map",
    context: resolve(__dirname, "fixture", fixture),
    entry: "./index.html",
    output: {
      path: resolve(__dirname, "../artifacts/test/output", fixture),
      filename: "bundle.js",
      publicPath: "/path/to/public/",
      assetModuleFilename: "[name].public[ext][query]",
    },
    plugins: [
      new HtmlBundlerPlugin({
        entry: {
          index: "index.html",
        },
        loaderOptions: {
          sources: [
            {
              tag: "meta",
              attributes: ["content"],
              filter: ({ attributes: { name } }) =>
                name === "msapplication-config" ||
                name === "msapplication-TileImage",
            },
          ],
        },
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(png|xml)$/,
          type: "asset/resource",
        },
        {
          test: /\/browserconfig\.xml$/i,
          type: "asset/resource",
          use: resolve(__dirname, "../artifacts/dist/index.js"),
        },
        {
          test: /\/notification-[135]\.xml$/i,
          type: "asset/resource",
          generator: {
            emit: false,
            filename: "[name][ext]",
            publicPath: "https://cdn.example.com/",
          },
        },
      ],
    },
  };
}
