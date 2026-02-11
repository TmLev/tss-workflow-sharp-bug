import { resizeStep } from "./steps/resize";

export type Result =
  | { kind: "success"; ok: { resizedImage: number } }
  | { kind: "error"; err: string };

export async function sharpWorkflow(): Promise<Result> {
  "use workflow";

  try {
    const result = await resizeStep();
    return { kind: "success" as const, ok: result };
  } catch (error) {
    return {
      kind: "error" as const,
      err:
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : JSON.stringify(error),
    };
  }
}
