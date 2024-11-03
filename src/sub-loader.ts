import type { LoaderDefinitionFunction } from "webpack";

const browserConfigSubLoader: LoaderDefinitionFunction = function () {
  return `module.exports = require(${JSON.stringify(this.utils.contextify(this.context, this.remainingRequest))});`;
};

module.exports = browserConfigSubLoader;
