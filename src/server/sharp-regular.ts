import sharp from "sharp";

import type { Result } from "./sharp";

export async function sharpRegular(): Promise<Result> {
  try {
    const image = await fetch("https://picsum.photos/536/354").then((r) =>
      r.arrayBuffer(),
    );

    const resized = await sharp(image)
      .resize(200, 200)
      .toFormat("jpeg")
      .toBuffer();

    return { kind: "success", ok: { resizedImage: resized.byteLength } };
  } catch (error) {
    return {
      kind: "error",
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
