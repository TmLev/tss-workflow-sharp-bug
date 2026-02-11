import sharp from "sharp";

export async function resizeStep() {
  "use step";

  const image = await fetch("https://picsum.photos/536/354").then((r) =>
    r.arrayBuffer(),
  );

  const resized = await sharp(image)
    .resize(200, 200)
    .toFormat("jpeg")
    .toBuffer();

  return { resizedImage: resized.byteLength };
}
