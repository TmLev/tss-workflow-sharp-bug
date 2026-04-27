import { access, cp } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";

import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { workflow } from "workflow/vite";

function copyTracedNodeModulesToWorkflowFunctions() {
  return {
    name: "copy-traced-node-modules-to-workflow-functions",
    apply: "build" as const,
    async closeBundle() {
      const functionsDir = fileURLToPath(
        new URL("./.vercel/output/functions", import.meta.url),
      );
      const tracedNodeModules = join(
        functionsDir,
        "__server.func",
        "node_modules",
      );

      try {
        await access(tracedNodeModules);
      } catch {
        return;
      }

      const workflowFunctionDirs = [
        ".well-known/workflow/v1/step.func",
        ".well-known/workflow/v1/flow.func",
        ".well-known/workflow/v1/webhook/[token].func",
      ];

      await Promise.all(
        workflowFunctionDirs.map((functionDir) =>
          cp(tracedNodeModules, join(functionsDir, functionDir, "node_modules"), {
            recursive: true,
            force: true,
          }),
        ),
      );
    },
  };
}

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    devtools(),
    nitro({ preset: "vercel" }),
    workflow({ runtime: "nodejs24.x" }),
    copyTracedNodeModulesToWorkflowFunctions(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
