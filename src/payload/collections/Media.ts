import { CollectionConfig } from "payload";

function rewriteMediaUrls<T extends Record<string, unknown>>(doc: T): T {
  const filename = typeof doc.filename === "string" ? doc.filename : undefined;

  if (filename) {
    doc.url = `/media/${filename}`;
  }

  if (doc.sizes && typeof doc.sizes === "object") {
    for (const size of Object.values(doc.sizes as Record<string, { filename?: string; url?: string }>)) {
      if (size?.filename) {
        size.url = `/media/${size.filename}`;
      }
    }
  }

  const sizes = doc.sizes as Record<string, { filename?: string }> | undefined;
  if (sizes?.thumbnail?.filename) {
    doc.thumbnailURL = `/media/${sizes.thumbnail.filename}`;
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
        return rewriteMediaUrls(doc as Record<string, unknown>);
      },
    ],
  },
  upload: {
    staticDir: "public/media",
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
