import {
  createRenderer,
  ExpressiveCodeBlock,
  type RehypeExpressiveCodeOptions,
} from "rehype-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import type { Element } from "hast";

// The renderer and Shiki grammars are shared across documents, summaries and sections.
export const codeBlockOptions: RehypeExpressiveCodeOptions = {
  themes: ["github-light", "github-dark"],
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) =>
    theme.type === "dark" ? ".dark" : ":root:not(.dark)",
  tabWidth: 0,
  plugins: [
    pluginLineNumbers(),
    {
      name: "reading-controls",
      baseStyles: `
        .frame[data-language]::after {
          content: attr(data-language);
          position: absolute;
          inset: 0.7rem var(--space-4) auto auto;
          z-index: 2;
          color: var(--muted-foreground);
          font: var(--text-xs) var(--font-mono), monospace;
          letter-spacing: 0.04em;
          pointer-events: none;
        }

        .frame .header {
          padding-inline-end: 6rem;
        }

        .frame pre {
          max-width: 100%;
        }

        .frame[data-copy-code] :nth-child(1 of .ec-line) .code {
          padding-inline-end: calc(var(--space-8) + var(--space-2) + var(--space-4));
        }

        .frame .header .code-copy {
          box-sizing: border-box;
          appearance: none;
          -webkit-appearance: none;
          position: absolute;
          inset-block-start: calc(100% + var(--space-2));
          inset-inline-end: var(--space-2);
          z-index: 3;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          margin: 0;
          padding: 0;
          border: 1px solid var(--floating-border);
          border-radius: var(--radius-md);
          color: var(--foreground);
          background: var(--floating-bg);
          box-shadow: var(--floating-shadow);
          -webkit-backdrop-filter: var(--floating-backdrop);
          backdrop-filter: var(--floating-backdrop);
          cursor: pointer;
          font: inherit;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          transition:
            opacity 0.15s,
            background-color 0.15s,
            border-color 0.15s,
            color 0.15s,
            box-shadow 0.15s;
        }

        .frame .header .code-copy svg {
          display: block;
          width: 1rem;
          height: 1rem;
          pointer-events: none;
        }

        .frame .header .code-copy:focus-visible {
          outline: 3px solid var(--ring);
          outline-offset: 2px;
        }

        @media (hover: hover) and (min-width: 768px) {
          .frame .header .code-copy {
            opacity: 0;
            pointer-events: none;
          }

          .frame:hover .header .code-copy,
          .frame:focus-within .header .code-copy {
            opacity: 1;
            pointer-events: auto;
          }
        }
      `,
      hooks: {
        postprocessRenderedBlockGroup: ({ renderedGroupContents }) => {
          for (const { codeBlock, renderedBlockAst } of renderedGroupContents) {
            renderedBlockAst.properties["data-language"] =
              codeBlock.language || "text";
            renderedBlockAst.properties["data-copy-code"] = codeBlock.code;
            const header = renderedBlockAst.children.find(
              (child): child is Element =>
                child.type === "element" && child.tagName === "figcaption",
            );
            header?.children.push({
              type: "element",
              tagName: "span",
              properties: {
                className: ["reading-code-copy-mount"],
                "data-copy-mount": "",
              },
              children: [],
            });
          }
        },
      },
    },
  ],
  frames: {
    showCopyToClipboardButton: false,
    extractFileNameFromCode: false,
    removeCommentsWhenCopyingTerminalFrames: false,
  },
  customCreateBlock: ({ input }) =>
    new ExpressiveCodeBlock({
      ...input,
      meta: /(?:^|\s)title=/.test(input.meta ?? "")
        ? input.meta
        : `${input.meta ?? ""} title="${input.language || "text"}"`,
    }),
  styleOverrides: {
    borderRadius: "var(--radius-surface)",
    borderColor: "var(--border)",
    codeFontFamily: "var(--font-mono)",
    codeFontSize: "var(--text-sm)",
    uiFontFamily: "var(--font-sans)",
    uiFontSize: "var(--text-xs)",
    frames: { frameBoxShadowCssValue: "none" },
  },
  customCreateRenderer: async () => ({
    ...(await getCodeRenderer()),
    jsModules: [],
  }),
};
let renderer: ReturnType<typeof createRenderer> | undefined;
export function getCodeRenderer() {
  return (renderer ??= createRenderer({
    ...codeBlockOptions,
    customCreateRenderer: undefined,
  }));
}
