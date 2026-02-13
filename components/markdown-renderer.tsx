import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders markdown content with GitHub-flavored markdown support.
 * Includes styling for common markdown elements like headers, lists, code blocks, etc.
 */
export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn('prose prose-sm dark:prose-invert max-w-none', className)}
      components={{
        // Headers
        h1: ({ node, ...props }) => (
          <h1 className="scroll-m-20 text-2xl font-bold tracking-tight mb-4" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="scroll-m-20 text-xl font-bold tracking-tight mb-3" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="scroll-m-20 text-lg font-semibold tracking-tight mb-3" {...props} />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="scroll-m-20 text-base font-semibold mb-2" {...props} />
        ),
        h5: ({ node, ...props }) => (
          <h5 className="scroll-m-20 text-sm font-semibold mb-2" {...props} />
        ),
        h6: ({ node, ...props }) => (
          <h6 className="scroll-m-20 text-xs font-semibold mb-2" {...props} />
        ),
        // Paragraphs
        p: ({ node, ...props }) => (
          <p className="leading-relaxed text-foreground/90 mb-3" {...props} />
        ),
        // Links
        a: ({ node, ...props }) => (
          <a className="text-primary underline hover:text-primary/80 transition-colors" {...props} />
        ),
        // Lists
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-outside space-y-2 mb-3 ml-5 text-foreground/90" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-outside space-y-2 mb-3 ml-5 text-foreground/90" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="leading-relaxed" {...props} />
        ),
        // Code blocks
        code: ({ node, inline, ...props }) => {
          if (inline) {
            return (
              <code className="relative rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground/90" {...props} />
            );
          }
          return (
            <code className="block rounded-lg bg-muted/50 border border-border p-3 font-mono text-xs text-foreground/90 overflow-x-auto mb-3" {...props} />
          );
        },
        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-muted-foreground pl-3 italic text-muted-foreground mb-3" {...props} />
        ),
        // Tables (from remark-gfm)
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full border-collapse border border-border text-xs" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => (
          <th className="border border-border bg-muted px-2 py-1 font-semibold text-left" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="border border-border px-2 py-1 text-foreground/90" {...props} />
        ),
        // Horizontal rule
        hr: ({ node, ...props }) => (
          <hr className="border-t border-border my-4" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
