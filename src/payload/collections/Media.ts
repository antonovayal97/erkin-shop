import path from "path";
import fs from "fs";
import { CollectionConfig } from "payload";

const mediaDir = path.resolve(process.cwd(), "public/media");

try {
  fs.mkdirSync(mediaDir, { recursive: true });
} catch {
  // directory may already exist or be created later by the uploader
}

type MediaDoc = {
  filename?: unknown;
  url?: string;
  thumbnailURL?: string;
  sizes?: Record<string, { filename?: string; url?: string }>;
};

/** Payload file endpoint — reliable on VPS after runtime uploads. */
function fileUrl(filename: string) {
  return `/api/media/file/${filename}`;
}

function rewriteMediaUrls(doc: MediaDoc): MediaDoc {
  const filename = typeof doc.filename === "string" ? doc.filename : undefined;

  if (filename) {
    doc.url = fileUrl(filename);
  }

  if (doc.sizes && typeof doc.sizes === "object") {
    for (const size of Object.values(doc.sizes)) {
      if (size?.filename) {
        size.url = fileUrl(size.filename);
      }
    }
  }

  if (doc.sizes?.thumbnail?.filename) {
    doc.thumbnailURL = fileUrl(doc.sizes.thumbnail.filename);
  }

  return doc;
}

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        return rewriteMediaUrls(doc as MediaDoc);
      },
    ],
  },
  upload: {
    // Absolute path so pm2/cwd mismatches don't write files elsewhere.
    staticDir: mediaDir,
    imageSizes: [
      { name: "thumbnail", width: 400, height: 400, position: "centre" },
      { name: "card", width: 768, height: 768, position: "centre" },
      { name: "tablet", width: 1024, height: undefined, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
};
