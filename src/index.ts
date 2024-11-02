import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { resolve } from "path";
import { callbackify } from "util";
import type { LoaderDefinitionFunction } from "webpack";

const browserConfigLoader: LoaderDefinitionFunction = function (source) {
  const XMLOptions = {
    attributeNamePrefix: "@_",
    ignoreAttributes: false,
    suppressEmptyNode: true,
  };
  const config = new XMLParser(XMLOptions).parse(source) as object;

  if (
    !hasProperty(config, "browserconfig") ||
    !hasProperty(config.browserconfig, "msapplication")
  ) {
    return source;
  }

  const { msapplication } = config.browserconfig;
  const tasks: Promise<void>[] = [];

  const loadSrc = async (obj: unknown): Promise<void> => {
    if (!hasProperty(obj, "@_src") || typeof obj["@_src"] !== "string") return;

    obj["@_src"] = await this.importModule(resolve(this.context, obj["@_src"]));
  };

  if (hasProperty(msapplication, "tile")) {
    const { tile } = msapplication;

    for (const tag of [
      "TileImage",
      "square70x70logo",
      "square150x150logo",
      "square310x310logo",
      "wide310x150logo",
    ]) {
      if (hasProperty(tile, tag)) tasks.push(loadSrc(tile[tag]));
    }
  }

  if (hasProperty(msapplication, "badge")) {
    const { badge } = msapplication;

    if (hasProperty(badge, "polling-uri")) {
      tasks.push(loadSrc(badge["polling-uri"]));
    }
  }

  if (hasProperty(msapplication, "notification")) {
    const { notification } = msapplication;

    for (const tag of [
      "polling-uri",
      "polling-uri2",
      "polling-uri3",
      "polling-uri4",
      "polling-uri5",
    ]) {
      if (hasProperty(notification, tag))
        tasks.push(loadSrc(notification[tag]));
    }
  }

  callbackify(async () => {
    await Promise.all(tasks);

    return new XMLBuilder(XMLOptions).build(config);
  })(this.async());
};

export default browserConfigLoader;

function hasProperty<T extends string>(
  obj: unknown,
  tag: T,
): obj is { [K in T]: unknown } {
  return typeof obj === "object" && obj != null && tag in obj;
}
