import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { rm } from "fs/promises";
import { resolve } from "path";
import { beforeAll, expect, it } from "vitest";
import type { Stats } from "webpack";
import compiler from "../compiler.js";

const outputPath = resolve(import.meta.dirname, "../../artifacts/test/output");

const XMLOptions = {
  attributeNamePrefix: "@_",
  format: true,
  ignoreAttributes: false,
  suppressEmptyNode: true,
};
const parser = new XMLParser(XMLOptions);
const builder = new XMLBuilder(XMLOptions);

beforeAll(async () => {
  try {
    await rm(outputPath, { recursive: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
  }
});

it("errors for browser configs with malformed XML", async () => {
  let error: unknown;

  try {
    await compiler("invalid/malformed-xml");
  } catch (err) {
    error = err;
  }

  expect(getErrorMessage(error)).toMatch("XMLParser.parse");
});

it("errors for browser configs with unresolved images", async () => {
  let error: unknown;

  try {
    await compiler("invalid/unresolved-image");
  } catch (err) {
    error = err;
  }

  expect(getErrorMessage(error)).toMatch("Can't resolve");
});

it("outputs comprehensive browser configs", async () => {
  const stats = await compiler("valid/comprehensive");

  expect(parseBrowserConfigXML(stats)).toMatchInlineSnapshot(`
    "<?xml version="1.0" encoding="utf-8"?>
    <browserconfig>
      <msapplication>
        <tile>
          <TileColor>#D5415C</TileColor>
          <TileImage src="/path/to/public/tile-300x300.public.png"/>
          <square70x70logo src="/path/to/public/tile-140x140.public.png"/>
          <square150x150logo src="/path/to/public/tile-300x300.public.png"/>
          <square310x310logo src="/path/to/public/tile-620x620.public.png"/>
          <wide310x150logo src="/path/to/public/tile-620x300.public.png"/>
        </tile>
        <badge>
          <polling-uri src="/path/to/public/badge.public.xml"/>
          <frequency>30</frequency>
        </badge>
        <notification>
          <polling-uri src="https://cdn.example.com/notification-1.xml"/>
          <polling-uri2 src="/path/to/public/notification-2.public.xml"/>
          <polling-uri3 src="https://cdn.example.com/notification-3.xml"/>
          <polling-uri4 src="/path/to/public/notification-4.public.xml"/>
          <polling-uri5 src="https://cdn.example.com/notification-5.xml"/>
          <frequency>30</frequency>
          <cycle>1</cycle>
        </notification>
      </msapplication>
    </browserconfig>
    "
  `);
});

it("outputs partially malformed browser configs", async () => {
  const stats = await compiler("valid/partially-malformed");

  expect(parseBrowserConfigXML(stats)).toMatchInlineSnapshot(`
    "<?xml version="1.0" encoding="utf-8"?>
    <browserconfig>
      <msapplication>
        <tile>
          <TileColor>#D5415C</TileColor>
          <TileImage/>
          <square70x70logo src="/path/to/public/tile-140x140.public.png"/>
          <square150x150logo/>
          <square310x310logo src="/path/to/public/tile-620x620.public.png"/>
          <wide310x150logo/>
        </tile>
        <badge>
          <polling-uri/>
          <frequency>30</frequency>
        </badge>
        <notification>
          <polling-uri/>
          <polling-uri2 src="/path/to/public/notification-2.public.xml"/>
          <polling-uri3/>
          <polling-uri4 src="/path/to/public/notification-4.public.xml"/>
          <polling-uri5/>
          <frequency>30</frequency>
          <cycle>1</cycle>
        </notification>
      </msapplication>
    </browserconfig>
    "
  `);
});

it("outputs browser configs with an empty msapplication tag", async () => {
  const stats = await compiler("valid/empty-msapplication");

  expect(parseBrowserConfigXML(stats)).toMatchInlineSnapshot(`
    "<?xml version="1.0" encoding="utf-8"?>
    <browserconfig>
      <msapplication/>
    </browserconfig>
    "
  `);
});

it("outputs browser configs with no msapplication tag", async () => {
  const stats = await compiler("valid/missing-msapplication");

  expect(parseBrowserConfigXML(stats)).toMatchInlineSnapshot(`
    "<?xml version="1.0" encoding="utf-8"?>
    <browserconfig/>
    "
  `);
});

function parseBrowserConfigXML(stats: Stats): string {
  const { modules = [] } = stats.toJson({ source: true });

  for (const { name, source } of modules) {
    if (name === "./browserconfig.xml") {
      return builder.build(parser.parse(String(source)));
    }
  }

  throw new Error("No browser config found in compilation");
}

function getErrorMessage(err: unknown): string {
  return Array.isArray(err) &&
    typeof err[0] === "object" &&
    err[0] != null &&
    "message" in err[0]
    ? err[0].message
    : "";
}
