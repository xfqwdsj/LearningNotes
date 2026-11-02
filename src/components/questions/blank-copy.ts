const skipped = ".katex-mathml, .sr-only, [hidden], script, style, template";

const blockTags = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DD",
  "DETAILS",
  "DIV",
  "DL",
  "DT",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "SUMMARY",
  "TABLE",
  "TBODY",
  "TD",
  "TFOOT",
  "TH",
  "THEAD",
  "TR",
  "UL",
]);

function insideField(node: Node | null) {
  const element =
    node instanceof Element ? node : (node?.parentElement ?? null);
  return Boolean(
    element?.closest("input, textarea, select, [contenteditable]"),
  );
}

/* KaTeX keeps a hidden MathML copy of each formula; its annotation is LaTeX source, not visible text. */
function plainText(root: Node) {
  const chunks: string[] = [];
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      chunks.push(node.nodeValue ?? "");
      return;
    }
    if (!(node instanceof Element)) return;
    if (node.matches(skipped)) return;
    if (node.tagName === "BR") {
      chunks.push("\n");
      return;
    }
    const block = blockTags.has(node.tagName);
    if (block) chunks.push("\n");
    for (const child of node.childNodes) visit(child);
    if (block) chunks.push("\n");
  };
  for (const child of root.childNodes) visit(child);
  return chunks
    .join("")
    .split("\n")
    .map((line) => line.replace(/[\t \u00a0]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function closestFormula(node: Node | null) {
  const element =
    node instanceof Element ? node : (node?.parentElement ?? null);
  return element?.closest(".katex") ?? null;
}

/* Matches KaTeX's copy-tex add-on: keep a formula's TeX source instead of its rendered glyphs. */
function replaceFormulas(container: Element) {
  for (const rendered of container.querySelectorAll(
    ".katex-mathml + .katex-html",
  ))
    rendered.remove();
  for (const mathml of container.querySelectorAll(".katex-mathml")) {
    const annotation = mathml.querySelector("annotation");
    if (!annotation) continue;
    const [open, close] = mathml.closest(".katex-display")
      ? ["$$", "$$"]
      : ["$", "$"];
    annotation.textContent = `${open}${annotation.textContent ?? ""}${close}`;
    mathml.replaceWith(annotation);
  }
}

function replaceBlanks(container: Element, placeholder: string) {
  for (const answer of container.querySelectorAll(".question-inline-answer"))
    answer.replaceWith(document.createTextNode(placeholder));
  /* A selection may start or end in the middle of a blank, cloning only its input. */
  for (const input of container.querySelectorAll(".question-inline-input"))
    input.replaceWith(document.createTextNode(placeholder));
}

export function blankClipboardPayload(
  selection: Selection,
  placeholder: string,
): { text: string; html: string | null } | null {
  if (selection.isCollapsed || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0).cloneRange();
  /* Expand partial formula selections the same way copy-tex does. */
  const start = closestFormula(range.startContainer);
  if (start) range.setStartBefore(start);
  const end = closestFormula(range.endContainer);
  if (end) range.setEndAfter(end);
  const container = document.createElement("div");
  container.append(range.cloneContents());
  if (
    !container.querySelector(".question-inline-answer, .question-inline-input")
  )
    return null;
  replaceBlanks(container, placeholder);
  /* The site drops rich HTML when formulas are copied, so keep math selections plain as well. */
  const math = Boolean(container.querySelector(".katex"));
  replaceFormulas(container);
  return {
    text: plainText(container),
    html: math ? null : container.innerHTML,
  };
}

/* Replaces fill-in blanks with their underscore placeholder in copied text only. */
export function copyBlankSelection(event: ClipboardEvent, placeholder: string) {
  if (!event.clipboardData) return false;
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0)
    return false;
  /* Copying inside an input or textarea keeps the typed value. */
  if (insideField(selection.anchorNode) || insideField(selection.focusNode))
    return false;
  const payload = blankClipboardPayload(selection, placeholder);
  if (!payload) return false;
  event.clipboardData.setData("text/plain", payload.text);
  if (payload.html) event.clipboardData.setData("text/html", payload.html);
  event.preventDefault();
  /* copy-tex would otherwise rebuild the copied text from the live selection and drop the blanks. */
  event.stopImmediatePropagation();
  return true;
}
