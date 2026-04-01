import * as esbuild from "esbuild";
import process from "node:process";
import { builtinModules } from "node:module";
import pkg from "./package.json" with { type: "json" };
import { sassPlugin } from "esbuild-sass-plugin";

const banner = `/*! ${pkg.name} v${pkg.version} | (c) ${pkg.author?.name} | ${pkg.repository?.url} */`;

const isProd = process.argv[2] === "production";

const context = await esbuild.context({
  entryPoints: ["src/main.ts", "src/styles.scss"],
  //outfile: "main.js",
  // outbase: 'src',
  outdir: ".",
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

  minify: isProd,
  sourcemap: isProd ? false : "inline",
  treeShaking: true,
  plugins: [sassPlugin()],
});

if (isProd) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
