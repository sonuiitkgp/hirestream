"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownDescriptionProps {
  content: string;
  className?: string;
}

export function MarkdownDescription({ content, className = "" }: MarkdownDescriptionProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          ul: ({ children }) => (
            <ul className="list-disc pl-4 my-1 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 my-1 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-muted-foreground leading-relaxed">{children}</li>
          ),
          p: ({ children }) => (
            <p className="text-sm text-muted-foreground leading-relaxed my-1">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
