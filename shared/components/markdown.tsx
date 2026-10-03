import ReactMarkdown, { type Components } from "react-markdown";

// Assistant answers come as Markdown (bold, lists, links). Raw HTML in the text is
// not rendered: react-markdown escapes it by default.
const components: Components = {
  p: ({ children }) => <p>{children}</p>,
  strong: ({ children }) => <strong className="font-medium">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  ul: ({ children }) => <ul className="m-0 list-disc pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="m-0 list-decimal pl-5">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
      {children}
    </a>
  ),
  h1: ({ children }) => <p className="font-medium">{children}</p>,
  h2: ({ children }) => <p className="font-medium">{children}</p>,
  h3: ({ children }) => <p className="font-medium">{children}</p>,
  code: ({ children }) => <code className="rounded-sm bg-line/20 px-1">{children}</code>,
  hr: () => <hr className="border-line" />,
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="flex max-w-[60ch] flex-col gap-2.5">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
