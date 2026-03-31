import * as esbuild from "esbuild";
import process from "node:process";
import { builtinModules } from "node:module";
import pkg from "./package.json" with { type: "json" };

const banner = `/*! ${pkg.name} v${pkg.version} | (c) ${pkg.author?.name} | ${pkg.repository?.url} */`;

const isProd = process.argv[2] === "production";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  // outbase: 'src',
  // outdir: 'dist',
  banner: {
    js: banner,
    // css: banner,
  },
  bundle: true,
  write: true,
  platform: "browser",
  format: "cjs",
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...builtinModules,
  ],
  outfile: "main.js",
  minify: isProd,
  sourcemap: isProd ? false : "inline",
  treeShaking: true,
});

if (isProd) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
