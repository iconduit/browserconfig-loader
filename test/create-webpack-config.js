import HtmlBundlerPlugin from "html-bundler-webpack-plugin";
import { resolve } from "path";

/**
 * @param {string} fixture
 * @returns {import('webpack').Configuration}
 */
export function createWebpackConfig(fixture) {
  return {
    mode: "production",
    devtool: "source-map",
    context: resolve(import.meta.dirname, "fixture", fixture),
    entry: "./index.html",
    output: {
      path: resolve(import.meta.dirname, "../artifacts/test/output", fixture),
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
          use: resolve(import.meta.dirname, "../artifacts/dist/esm/index.js"),
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
