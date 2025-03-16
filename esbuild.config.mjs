// esbuild.config.mjs
import esbuild from "esbuild";
import process from "process";

// Production build
if (process.argv[2] === "production") {
  esbuild.buildSync({
    entryPoints: ["main.ts"],
    bundle: true,
    external: ["obsidian"],
    format: "cjs",
    target: "es2018",
    outfile: "main.js",
    minify: true
  });
  console.log("Production build completed");
} 
// Development build
else {
  esbuild.buildSync({
    entryPoints: ["main.ts"],
    bundle: true,
    external: ["obsidian"],
    format: "cjs",
    target: "es2018",
    outfile: "main.js",
    sourcemap: "inline"
  });
  console.log("Development build completed");
}
