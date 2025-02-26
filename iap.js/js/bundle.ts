import { readFile } from "fs/promises";
import type { BunPlugin } from "bun";
import { isolatedDeclaration } from "oxc-transform";

function getDtsBunPlugin(): BunPlugin {
  const wroteTrack = new Set<string>();
  return {
    name: "oxc-transform-dts",
    setup(builder) {
      if (builder.config.root && builder.config.outdir) {
        const rootPath = Bun.pathToFileURL(builder.config.root).pathname;
        const outPath = Bun.pathToFileURL(builder.config.outdir).pathname;
        builder.onStart(() => wroteTrack.clear());
        builder.onLoad({ filter: /\.ts$/ }, async (args) => {
          if (args.path.startsWith(rootPath) && !wroteTrack.has(args.path)) {
            wroteTrack.add(args.path);
            const { code } = isolatedDeclaration(
              args.path,
              await Bun.file(args.path).text()
            );
            await Bun.write(
              args.path
                .replace(new RegExp(`^${rootPath}`), outPath)
                .replace(/\.ts$/, ".d.ts"),
              code
            );
          }
          return undefined;
        });
      }
    },
  };
}

const license = await readFile("./LICENSE", "utf-8");

await Bun.build({
  entrypoints: ["./src/apple"],
  outdir: "./build",
  packages: "external",
  root: "./src",
  splitting: true,
  minify: {
    syntax: true,
  },
  banner:
    license
      .trim()
      .split("\n")
      .map((line) => `// ${line}`)
      .join("\n") + "\n\n",
  plugins: [getDtsBunPlugin()],
});
