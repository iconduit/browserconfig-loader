# Iconduit browser configuration loader

_A Webpack loader for `browserconfig.xml` files_

[![Current NPM version][badge-npm-version-image]][badge-npm-version-link]
[![Build status][badge-build-image]][badge-build-link]
[![Test coverage][badge-coverage-image]][badge-coverage-link]

[badge-build-image]:
  https://img.shields.io/github/actions/workflow/status/iconduit/browserconfig-loader/ci-library.yml?branch=main&style=for-the-badge
[badge-build-link]:
  https://github.com/iconduit/browserconfig-loader/actions/workflows/ci-library.yml
[badge-coverage-image]:
  https://img.shields.io/codecov/c/gh/iconduit/browserconfig-loader?style=for-the-badge
[badge-coverage-link]: https://codecov.io/gh/iconduit/browserconfig-loader
[badge-npm-version-image]:
  https://img.shields.io/npm/v/%40iconduit%2Fbrowserconfig-loader?label=%40iconduit%2Fbrowserconfig-loader&logo=npm&style=for-the-badge
[badge-npm-version-link]:
  https://npmjs.com/package/@iconduit/browserconfig-loader

This loader processes [browser configuration] files, adding any images or polling
URI assets to the bundle and resolving their URLs in the output browser configuration
file.

[browser configuration]: https://msdn.microsoft.com/library/dn320426(v%3Dvs.85)

It supports:

- Resolving [tile images]
- Resolving [badge polling URI assets]
- Resolving [notification polling URI assets]

[tile images]:
  https://msdn.microsoft.com/library/dn320426(v%3Dvs.85)#specifying-tile-images-and-assets
[badge polling uri assets]:
  https://msdn.microsoft.com/library/dn320426(v%3Dvs.85)#defining-badge-polling
[notification polling uri assets]:
  https://msdn.microsoft.com/library/dn320426(v%3Dvs.85)#defining-notification-polling

## Usage

```js
// webpack.config.js
export default {
  // ...
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|xml)$/i,
        type: "asset/resource",
      },
      {
        test: /\/browserconfig\.xml$/i,
        type: "asset/resource",
        use: "@iconduit/browserconfig-loader",
      },
    ],
  },
};
```
