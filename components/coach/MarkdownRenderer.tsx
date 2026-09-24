/**
 * MarkdownRenderer Component - Visual Text Purifier for SabanOS Coach
 * ח. סבן חומרי בניין (1994) בע״מ
 * 
 * Renders rich Hebrew text while strictly stripping out raw machine blocks:
 * 1. <<<VOICE_SCRIPT>>>...<<<END_VOICE_SCRIPT>>> (Handled exclusively by VoicePlayer)
 * 2. :::mirror...::: (Handled exclusively by MirrorCard)
 * 3. :::prompt...::: (Handled exclusively by PromptCard)
 * 4. :::quiz...::: (Handled exclusively by QuizCard)
 */

import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Strips all internal machine blocks from the visual display
 */
export function stripMachineBlocks(text: string): string {
  if (!text) return "";

  return text
    // Strip Voice Script block (including streaming partials)
    .replace(/<<<VOICE_SCRIPT>>>[\s\S]*?(?:<<<END_VOICE_SCRIPT>>>|$)/gi, "")
    // Strip Mirror block
    .replace(/:::mirror[\s\S]*?(?::::|$)/gi, "")
    // Strip Prompt block
    .replace(/:::prompt[\s\S]*?(?::::|$)/gi, "")
    // Strip Quiz block
    .replace(/:::quiz[\s\S]*?(?::::|$)/gi, "")
    .trim();
}

/**
 * Formats basic Markdown elements into styled React components
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  const cleanContent = stripMachineBlocks(content);

  if (!cleanContent) return null;

  // Split into lines/paragraphs for parsing
  const lines = cleanContent.split("\n");

  const renderInlineFormatted = (lineText: string) => {
    // Replace **bold** with <strong>
    const parts = lineText.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-extrabold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 ${className}`}
      dir="rtl"
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Headings (###, ##, #)
        if (trimmed.startsWith("### ")) {
          return (
            <h4
              key={idx}
              className="text-sm sm:text-base font-extrabold text-slate-900 pt-2 pb-0.5 border-b border-slate-100 flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block"></span>
              {renderInlineFormatted(trimmed.slice(4))}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3
              key={idx}
              className="text-base sm:text-lg font-black text-slate-900 pt-2.5 pb-1 text-orange-950"
            >
              {renderInlineFormatted(trimmed.slice(3))}
            </h3>
          );
        }

        // Bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pr-2 text-slate-800">
              <span className="text-orange-500 font-bold shrink-0 mt-0.5">•</span>
              <span className="leading-snug">{renderInlineFormatted(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Numbered list (e.g. "1. ", "2. ")
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pr-1 text-slate-800">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-800 text-[11px] font-bold mt-0.5">
                {numMatch[1]}
              </span>
              <span className="leading-snug">{renderInlineFormatted(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph line
        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineFormatted(line)}
          </p>
        );
      })}
    </div>
  );
};
