import { type ReactNode } from "react";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import type { RootContent } from "hast";
import { ProblemSet } from "./questions/problem-set";
import { RichContent } from "./rich-content";
import { DemoProvider } from "./demo-renderer";
import { SectionHeading } from "./section-heading";
import type { Document } from "@/lib/content/types";
import { clientProblemSet } from "@/lib/content/learning-client";
import { DEFAULT_PROBLEM_SET_ID } from "@/lib/content/learning-types";

export function ContentRenderer({ document: doc }: { document: Document }) {
  const context = {
    title: doc.title.text,
    href: doc.href,
    markdownUrl: doc.markdownUrl,
    privateContent: doc.private,
    storageKey: `${doc.private ? "private" : "public"}:${doc.key}:${doc.lang}`,
    sections: doc.sections.map(
      ({ id, title, markdownUrl, slot, references }) => ({
        id,
        title: title.text,
        markdownUrl,
        ...(slot ? { slot } : {}),
        ...(references?.length ? { references } : {}),
      }),
    ),
  };
  const prose = (html: string, key: string) => (
    <div key={key} className="prose prose-neutral dark:prose-invert max-w-none">
      <RichContent
        html={html}
        renderProblemSet={(id) => {
          const set = doc.problemSets?.find((item) => item.id === id);
          if (!set) throw new Error(`Missing compiled problem set: ${id}`);
          return <ProblemSet set={clientProblemSet(set)} context={context} />;
        }}
        renderDefaultQuestions={(blockId) => {
          const set = doc.problemSets?.find(
            (item) => item.id === DEFAULT_PROBLEM_SET_ID,
          );
          if (!set) throw new Error("Missing compiled default question set");
          return (
            <ProblemSet
              set={clientProblemSet(set)}
              context={context}
              defaultBlockId={blockId}
            />
          );
        }}
      />
    </div>
  );
  function blocks(nodes: RootContent[], prefix: string): ReactNode[] {
    const parts: ReactNode[] = [];
    let html = "";
    const flush = () => {
      if (html.trim())
        parts.push(prose(html, `${prefix}-text-${parts.length}`));
      html = "";
    };
    nodes.forEach((node, index) => {
      const key = `${prefix}-${index}`;
      if (node.type !== "element") {
        html += toHtml(node);
        return;
      }
      const classes = node.properties.className;
      if (
        Array.isArray(classes) &&
        ["content-inclusion", "semantic-section", "authored-work"].some(
          (name) => classes.includes(name),
        )
      ) {
        flush();
        parts.push(
          <section
            key={key}
            className={classes.join(" ")}
            id={
              typeof node.properties.id === "string"
                ? node.properties.id
                : undefined
            }
            data-slot={node.properties["dataSlot"]}
            data-owner={node.properties["dataOwner"]}
            data-source={node.properties["dataSource"]}
            lang={
              typeof node.properties.lang === "string"
                ? node.properties.lang
                : undefined
            }
          >
            {blocks(node.children, key)}
          </section>,
        );
      } else if (
        /^h[2-6]$/.test(node.tagName) &&
        typeof node.properties.id === "string"
      ) {
        flush();
        const section = doc.sections.find(
          (item) => item.id === node.properties.id,
        );
        parts.push(
          <SectionHeading
            key={key}
            heading={{
              id: String(node.properties.id),
              title: section?.title ?? { markdown: "", text: "", html: "" },
              depth: Number(node.tagName.slice(1)),
              html: toHtml(node),
            }}
            context={context}
          />,
        );
      } else html += toHtml(node);
    });
    flush();
    return parts;
  }
  return (
    <DemoProvider records={doc.demos ?? {}}>
      {blocks(fromHtml(doc.html, { fragment: true }).children, "content")}
    </DemoProvider>
  );
}
