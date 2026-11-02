import type { Plugin } from "unified";
import type { Root } from "mdast";
import type { Construct, Tokenizer, State } from "micromark-util-types";
import type { Extension } from "mdast-util-from-markdown";

declare module "micromark-util-types" {
  interface TokenTypeMap {
    learningMathText: "learningMathText";
    learningMathFlow: "learningMathFlow";
    learningMathData: "learningMathData";
    learningMathMarker: "learningMathMarker";
  }
}
function construct(display: boolean): Construct {
  const tokenize: Tokenizer = function (effects, ok, nok) {
    const type = display ? "learningMathFlow" : "learningMathText";
    const open = display ? 91 : 40;
    const close = display ? 93 : 41;
    const start: State = (code) => {
      if (code !== 92) return nok(code);
      effects.enter(type);
      effects.enter("learningMathMarker");
      effects.consume(code);
      return opening;
    };
    const opening: State = (code) => {
      if (code !== open) return nok(code);
      effects.consume(code);
      effects.exit("learningMathMarker");
      return inside;
    };
    let lineEndings = 0;
    const inside: State = (code) => {
      if (code === null || (!display && code < -2)) return nok(code);
      if (code < -2) {
        lineEndings++;
        // Display math may span lines, but a blank line means it did not
        // close. Return a no-match before escaped brackets such as `\[!NOTE]`.
        if (display && lineEndings > 1) return nok(code);
        effects.enter("lineEnding");
        effects.consume(code);
        effects.exit("lineEnding");
        return inside;
      }
      lineEndings = 0;
      effects.enter("learningMathData");
      effects.consume(code);
      effects.exit("learningMathData");
      return code === 92 ? closing : inside;
    };
    const closing: State = (code) => {
      if (code === close) {
        effects.enter("learningMathMarker");
        effects.consume(code);
        effects.exit("learningMathMarker");
        effects.exit(type);
        return ok;
      }
      return inside(code);
    };
    return start;
  };
  return {
    name: display ? "learningMathFlow" : "learningMathText",
    concrete: display,
    tokenize,
  };
}
export function bracketMathExtensions() {
  const extension: Extension = { enter: {}, exit: {} };
  for (const display of [false, true]) {
    const type = display ? "learningMathFlow" : "learningMathText";
    extension.enter ??= {};
    extension.exit ??= {};
    extension.enter[type] = function (token) {
      this.enter(
        display
          ? { type: "math", meta: null, value: "" }
          : { type: "inlineMath", value: "" },
        token,
      );
      this.buffer();
    };
    extension.exit[type] = function (token) {
      this.resume();
      const node = this.stack[this.stack.length - 1];
      if (node?.type !== "math" && node?.type !== "inlineMath")
        throw new Error("Invalid math token");
      node.value = this.sliceSerialize(token).slice(2, -2).trim();
      node.data = {
        hName: display ? "pre" : "code",
        hProperties: {
          className: [
            "language-math",
            display ? "math-display" : "math-inline",
          ],
        },
        hChildren: [{ type: "text", value: node.value }],
      };
      this.exit(token);
    };
  }
  return {
    syntax: { text: { 92: construct(false) }, flow: { 92: construct(true) } },
    mdast: extension,
  };
}
export const remarkBracketMath: Plugin<[], Root> = function () {
  const data = this.data();
  const extensions = bracketMathExtensions();
  (data.micromarkExtensions ??= []).push(extensions.syntax);
  (data.fromMarkdownExtensions ??= []).push(extensions.mdast);
};
