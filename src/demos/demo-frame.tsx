import { MarkdownText } from "@/components/markdown-text";
import { renderIcuMarkdown, type IcuValues } from "@/lib/markdown/icu";
import type { MarkdownValue } from "@/lib/markdown/types";
import { useMemo, type ReactNode } from "react";
import { createContentFormatter } from "@/i18n/format";
import { IcuMarkdownText } from "@/components/icu-markdown-text";
import { useClientReady } from "@/components/client-ready";
import type { DemoComponentProps } from "./types";
export { DemoRange } from "./demo-range";
function useControlsReady() {
  return useClientReady();
}
export function useDemoContent({ locale, messages }: DemoComponentProps) {
  const t = useMemo(
    () => createDemoTranslator(locale, messages),
    [locale, messages],
  );
  const format = useMemo(() => createContentFormatter(locale), [locale]);
  const ready = useControlsReady();
  return { t, format, ready };
}
export function DemoFrame({
  title,
  locale,
  label,
  intro,
  children,
  controls,
  conclusion,
}: {
  title: MarkdownValue;
  locale: string;
  label: string;
  intro: string;
  children: ReactNode;
  controls: ReactNode;
  conclusion: ReactNode;
}) {
  const ready = useControlsReady();
  return (
    <section
      lang={locale}
      className="interactive-demo not-prose"
      aria-label={label}
    >
      <div className="demo-header">
        <h3>
          <MarkdownText value={title} />
        </h3>
      </div>
      <p className="demo-intro">
        <IcuMarkdownText value={intro} />
      </p>
      {children}
      <fieldset className="demo-controls" disabled={!ready}>
        {controls}
      </fieldset>
      <div className="demo-conclusion" aria-live="polite">
        {conclusion}
      </div>
    </section>
  );
}

export function createDemoTranslator(
  locale: string,
  messages: Record<string, string>,
) {
  const message = (key: string) => {
    const template = messages[key];
    if (template === undefined) throw new Error(`Missing demo message: ${key}`);
    return template;
  };
  return Object.assign(
    (key: string, values?: IcuValues) =>
      renderIcuMarkdown(message(key), values, { locale }).text,
    {
      raw: (key: string) => message(key),
      markdown: (key: string, values?: IcuValues) =>
        renderIcuMarkdown(message(key), values, { locale }),
    },
  );
}
