import path from "node:path";
import { promises as fs } from "node:fs";
import sharp from "sharp";
import { getPayloadClient } from "@/lib/payload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MediaLike = {
  filename?: unknown;
};

function getFilename(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const filename = (value as MediaLike).filename;
  return typeof filename === "string" && filename.trim() ? filename.trim() : undefined;
}

export async function GET() {
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({
      slug: "shop-settings",
      depth: 1,
    });
    const faviconValue = (settings as unknown as { favicon?: unknown }).favicon;
    let filename = getFilename(faviconValue);

    if (!filename && (typeof faviconValue === "string" || typeof faviconValue === "number")) {
      const media = await payload.findByID({
        collection: "media",
        id: faviconValue,
        depth: 0,
      });
      filename = getFilename(media);
    }

    if (!filename) {
      return new Response("Favicon не настроен", { status: 404 });
    }

    const mediaPath = path.join(process.cwd(), "public" + "/media", path.basename(filename));
    const source = await fs.readFile(mediaPath);
    const favicon = await sharp(source)
      .resize(64, 64, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();

    return new Response(favicon, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[favicon] Не удалось сгенерировать favicon:", error);
    return new Response("Favicon недоступен", { status: 404 });
  }
}
