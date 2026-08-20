import { CollectionConfig } from "payload";

type MediaDoc = {
  filename?: unknown;
  url?: string;
  thumbnailURL?: string;
  sizes?: Record<string, { filename?: string; url?: string }>;
};

function rewriteMediaUrls(doc: MediaDoc): MediaDoc {
  const filename = typeof doc.filename === "string" ? doc.filename : undefined;

  if (filename) {
    doc.url = `/media/${filename}`;
  }

  if (doc.sizes && typeof doc.sizes === "object") {
    for (const size of Object.values(doc.sizes)) {
      if (size?.filename) {
        size.url = `/media/${size.filename}`;
      }
    }
  }

  if (doc.sizes?.thumbnail?.filename) {
    doc.thumbnailURL = `/media/${doc.sizes.thumbnail.filename}`;
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
