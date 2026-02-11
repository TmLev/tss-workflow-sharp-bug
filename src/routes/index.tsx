import { Result, sharpWorkflow } from "@/workflows/sharp";
import { sharpRegular } from "@/server/sharp-regular";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useTransition } from "react";
import { start } from "workflow/api";
import { z } from "zod";

const resizeImage = createServerFn({ method: "POST" })
  .inputValidator(z.object({ mode: z.enum(["regular", "workflow"]) }))
  .handler(async (input) => {
    if (input.data.mode === "workflow") {
      const run = await start(sharpWorkflow);
      const result = await run.returnValue;
      return result;
    }

    return await sharpRegular();
  });

export const Route = createFileRoute("/")({
  ssr: false,
  component: App,
});

function App() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <ResizeImage mode="workflow" buttonText="Resize image via Workflow" />
      </div>
      <div>
        <ResizeImage mode="regular" buttonText="Resize image regularly" />
      </div>
    </div>
  );
}

function ResizeImage({
  mode,
  buttonText,
}: {
  mode: "regular" | "workflow";
  buttonText: string;
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <button
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50 p-4 text-center"
        disabled={isPending}
        onClick={async () => {
          startTransition(async () => {
            const result = await resizeImage({ data: { mode } });
            startTransition(() => setResult(result));
          });
        }}
      >
        {buttonText}
      </button>

      {isPending && <div>Loading...</div>}
      {result && <div>Result: {JSON.stringify(result, null, 2)}</div>}
    </>
  );
}
