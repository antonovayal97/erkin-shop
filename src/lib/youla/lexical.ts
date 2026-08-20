import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import type { SerializedEditorState } from "lexical";

export function lexicalToPlaintext(data: unknown): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  try {
    return convertLexicalToPlaintext({ data: data as SerializedEditorState });
  } catch {
    return undefined;
  }
}

export function textToLexical(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return null;
  }

  return {
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr",
      children: paragraphs.map((paragraph) => ({
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        children: [
          {
            type: "text",
            text: paragraph,
            format: 0,
            detail: 0,
            mode: "normal",
            style: "",
            version: 1,
          },
        ],
      })),
    },
  };
}
