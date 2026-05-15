import { HtmlBasePlugin } from "@11ty/eleventy";
import fs from "node:fs/promises";
import path from "node:path";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  eleventyConfig.addFilter("year", (date) => new Date(date).getFullYear());

  // HtmlBasePlugin doesn't rewrite data-src/data-srcset (used by the legacy
  // lazyload JS). Patch them so PATH_PREFIX applies on subpath deployments.
  const rawPrefix = process.env.PATH_PREFIX || "/";
  const prefix = rawPrefix.replace(/\/$/, "");

  if (prefix) {
    eleventyConfig.addTransform("path-prefix-data-attrs", function (content) {
      if (!this.page?.outputPath?.endsWith(".html")) return content;
      content = content.replace(/data-src="(\/[^"\/][^"]*)"/g, (_, p) => `data-src="${prefix}${p}"`);
      content = content.replace(/data-srcset="([^"]+)"/g, (_, value) => {
        const items = value.split(",").map((it) => {
          const parts = it.trim().split(/\s+/);
          if (parts[0]?.startsWith("/") && !parts[0].startsWith("//")) {
            parts[0] = prefix + parts[0];
          }
          return parts.join(" ");
        });
        return `data-srcset="${items.join(", ")}"`;
      });
      return content;
    });

    // The JS bundle and the CSS bundle reference absolute /assets/* paths at
    // runtime (HtmlBasePlugin only rewrites HTML attributes). Patch both after
    // the build so subpath deployments resolve correctly.
    eleventyConfig.on("eleventy.after", async ({ dir }) => {
      const targets = [
        path.join(dir.output, "assets/js/app.js"),
        path.join(dir.output, "assets/css/styles.css"),
        path.join(dir.output, "assets/css/complianz-banner.css"),
      ];
      const patterns = [
        // JS string literals: "/assets/..." or '/assets/...'
        [/(["'])\/assets\//g, `$1${prefix}/assets/`],
        // CSS url() references: url(/assets/...) or url("/assets/...")
        [/url\(\s*(["']?)\/assets\//g, `url($1${prefix}/assets/`],
      ];
      for (const file of targets) {
        try {
          let content = await fs.readFile(file, "utf8");
          let patched = content;
          for (const [re, rep] of patterns) patched = patched.replace(re, rep);
          if (patched !== content) await fs.writeFile(file, patched);
        } catch {}
      }
    });
  }

  return {
    pathPrefix: rawPrefix,
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
