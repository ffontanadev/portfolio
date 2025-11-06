"use client";

import { marked } from "marked";

export default function MarkdownRenderer({ content }: { content: string }) {
  const html = marked(content);

  return (
    <div
      className="prose prose-invert max-w-none text-white text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
