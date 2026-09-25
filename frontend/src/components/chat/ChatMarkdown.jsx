import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

/* eslint-disable no-unused-vars -- `node` is destructured so it isn't forwarded to the DOM */
const components = {
  a: ({ node, children, ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent underline underline-offset-2"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ),
  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0" {...props} />,
  ol: ({ node, ...props }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
  h1: ({ node, ...props }) => <p className="mb-2 font-semibold" {...props} />,
  h2: ({ node, ...props }) => <p className="mb-2 font-semibold" {...props} />,
  h3: ({ node, ...props }) => <p className="mb-2 font-semibold" {...props} />,
  code: ({ node, ...props }) => <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[0.85em]" {...props} />,
  pre: ({ node, ...props }) => (
    <pre className="mb-2 overflow-x-auto rounded bg-gray-800 p-3 text-gray-100 [&_code]:bg-transparent [&_code]:p-0" {...props} />
  ),
};
/* eslint-enable no-unused-vars */

/** Render an assistant reply as sanitized markdown. Raw HTML is never rendered. */
export default function ChatMarkdown({ children }) {
  return (
    <ReactMarkdown rehypePlugins={[rehypeSanitize]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
