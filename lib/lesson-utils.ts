import type { L10n, Lesson } from "@/data/lessons/types";

const firstHeading = (md: string) => md.match(/^#{1,3}\s+(.+)$/m)?.[1]?.trim() ?? null;

/** "On this page" entries: the first heading of each text section. */
export function lessonOutline(lesson: Lesson): { index: number; title: L10n }[] {
  const out: { index: number; title: L10n }[] = [];
  lesson.sections.forEach((s, i) => {
    if (s.type !== "text") return;
    const en = firstHeading(s.body.en);
    if (en) out.push({ index: i, title: { en, ar: firstHeading(s.body.ar) ?? en } });
  });
  return out;
}

/**
 * The lesson's own recap: its "## Summary" section when present, otherwise the
 * opening "What you'll learn" objectives. Heading is stripped (the panel has one).
 */
export function lessonSummary(lesson: Lesson): { kind: "summary" | "objectives"; body: L10n } | null {
  const texts = lesson.sections.filter((s) => s.type === "text");
  const strip = (md: string) => md.replace(/^#{1,3}\s+.+\n+/, "").trim();
  const summary = texts.find((s) => /^##\s+(Summary|Recap|Key takeaways)/i.test(s.body.en));
  if (summary) return { kind: "summary", body: { en: strip(summary.body.en), ar: strip(summary.body.ar) } };
  const first = texts[0];
  if (first) return { kind: "objectives", body: { en: strip(first.body.en), ar: strip(first.body.ar) } };
  return null;
}

/** Plain lesson text in one language — grounding context for the AI tutor. */
export function lessonContext(lesson: Lesson, lang: "en" | "ar", maxChars = 40_000): string {
  const parts: string[] = [];
  for (const s of lesson.sections) {
    if (s.type === "text") parts.push(s.body[lang]);
    else if (s.type === "code-demo") parts.push(`${s.explanation[lang]}\n\`\`\`\n${s.code}\n\`\`\``);
    else if (s.type === "exercise") parts.push(`Exercise: ${s.prompt[lang]}`);
  }
  const text = parts.join("\n\n");
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}
