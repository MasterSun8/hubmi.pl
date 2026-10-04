import ReactMarkdown, { type Components } from "react-markdown";

// The AI report is a document: unlike chat answers it keeps its headings as headings.
const components: Components = {
  h1: ({ children }) => <h3 className="text-subtitle font-light text-primary">{children}</h3>,
  h2: ({ children }) => <h3 className="text-subtitle font-light text-primary">{children}</h3>,
  h3: ({ children }) => <h4 className="text-lead font-medium">{children}</h4>,
  h4: ({ children }) => <h4 className="font-medium">{children}</h4>,
  p: ({ children }) => <p>{children}</p>,
  strong: ({ children }) => <strong className="font-medium">{children}</strong>,
  ul: ({ children }) => <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="m-0 flex list-decimal flex-col gap-1.5 pl-5">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  hr: () => <hr className="w-full border-line" />,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
      {children}
    </a>
  ),
  table: ({ children }) => <table className="w-full border-collapse text-caption">{children}</table>,
  th: ({ children }) => <th className="border-b border-line py-1.5 pr-5 text-left font-medium">{children}</th>,
  td: ({ children }) => <td className="border-b border-line py-1.5 pr-5">{children}</td>,
};

export function ReportMarkdown({ children }: { children: string }) {
  return (
    <div className="flex max-w-[75ch] flex-col gap-4">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
