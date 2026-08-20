import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "lexical";

interface ProductDescriptionProps {
  description: unknown;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  if (!description || typeof description !== "object") {
    return null;
  }

  return (
    <RichText
      data={description as SerializedEditorState}
      className="prose prose-invert max-w-none text-muted-foreground leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0"
    />
  );
}
