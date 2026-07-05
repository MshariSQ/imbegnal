"use client";

import ReactMarkdown from "react-markdown";
import { useLang } from "@/lib/lang-context";
import type { L10n } from "@/data/lessons/types";

export default function TextBlock({ body }: { body: L10n }) {
  const { lang } = useLang();
  return (
    <div className="lesson-prose text-[15px] leading-relaxed text-gray-300">
      <ReactMarkdown
        components={{
          h1: (props) => <h2 className="text-xl font-extrabold text-white mt-8 mb-3" {...props} />,
          h2: (props) => <h2 className="text-xl font-extrabold text-white mt-8 mb-3" {...props} />,
          h3: (props) => <h3 className="text-base font-bold text-white mt-6 mb-2" {...props} />,
          p: (props) => <p className="mb-4" {...props} />,
          ul: (props) => <ul className="list-disc ps-6 mb-4 space-y-1.5" {...props} />,
          ol: (props) => <ol className="list-decimal ps-6 mb-4 space-y-1.5" {...props} />,
          li: (props) => <li {...props} />,
          strong: (props) => <strong className="text-white font-bold" {...props} />,
          a: (props) => (
            <a className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return (
                <code dir="ltr" className="block font-mono text-[13px] text-gray-200" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                dir="ltr"
                className="font-mono text-[13px] bg-[#161B22] border border-[#21262d] rounded px-1.5 py-0.5 text-emerald-300"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: (props) => (
            <pre
              dir="ltr"
              className="bg-[#161B22] border border-[#21262d] rounded-xl p-4 mb-4 overflow-x-auto text-start"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote className="border-s-2 border-emerald-500/50 ps-4 my-4 text-gray-400 italic" {...props} />
          ),
        }}
      >
        {body[lang]}
      </ReactMarkdown>
    </div>
  );
}
