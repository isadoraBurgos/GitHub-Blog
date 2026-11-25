import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface MarkdownRendererProps {
  content: string
}

const components: Components = {
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue underline decoration-base-label hover:text-base-title focus-visible:ring-2 focus-visible:ring-blue"
    >
      {children}
    </a>
  ),
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-lg bg-base-input p-4 text-sm text-base-text">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded bg-base-input px-1 py-0.5 text-sm text-base-subtitle">{children}</code>
  ),
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="mt-6 text-base text-base-text">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
