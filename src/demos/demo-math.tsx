import { renderMathToHtml } from "@/lib/math";
export function Tex({
  source,
  display = false,
}: {
  source: string;
  display?: boolean;
}) {
  const html = { __html: renderMathToHtml(source, display) };
  return display ? (
    <div
      className="demo-math demo-math-display"
      dangerouslySetInnerHTML={html}
    />
  ) : (
    <span className="demo-math" dangerouslySetInnerHTML={html} />
  );
}
export function SvgTex({
  x,
  y,
  width = 30,
  height = 22,
  source,
  align = "left",
}: {
  x: number;
  y: number;
  width?: number;
  height?: number;
  source: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <div
        {...({
          xmlns: "http://www.w3.org/1999/xhtml",
        } as Record<string, string>)}
        className="demo-graph-formula"
        style={{ textAlign: align }}
      >
        <Tex source={source} />
      </div>
    </foreignObject>
  );
}
