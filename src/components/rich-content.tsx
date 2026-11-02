import {
  Children,
  createElement,
  Fragment,
  isValidElement,
  type ReactNode,
  type HTMLAttributes,
  type ImgHTMLAttributes,
} from "react";
import { Info } from "lucide-react";
import { ContentDisclosure } from "./content-disclosure";
import { ProofDisclosure } from "./proof-disclosure";
import { AnswerDisclosure } from "./questions/answer-disclosure";
import { jsx, jsxs } from "react/jsx-runtime";
import { fromHtml } from "hast-util-from-html";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Root, RootContent } from "hast";
import { ImageRegion } from "./image-region";
import { ZoomableImage } from "./image-zoom";
import { DemoMount } from "./demo-renderer";
import type { ImageRegionData } from "@/lib/content/learning-types";

function markImagesForZoom(nodes: RootContent[], insideLink = false) {
  for (const node of nodes) {
    if (node.type !== "element") continue;
    const linked = insideLink || node.tagName === "a";
    if (node.tagName === "img") {
      node.properties.loading ??= "lazy";
      node.properties.decoding ??= "async";
      if (insideLink) delete node.properties["data-image-zoom"];
      else node.properties["data-image-zoom"] = "";
    } else {
      markImagesForZoom(node.children, linked);
    }
  }
}

function NativeImage({
  alt = "",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  // Linked images stay native links and bypass the zoom wrapper.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} {...props} />;
}

export function RichContent({
  html,
  renderBlank,
  renderProblemSet,
  renderDefaultQuestions,
  headingPrefix,
  renderDemos = true,
  renderDisclosures = true,
}: {
  html: string;
  headingPrefix?: ReactNode;
  renderBlank?: (id: string) => ReactNode;
  renderProblemSet?: (id: string) => ReactNode;
  renderDefaultQuestions?: (blockId: string) => ReactNode;
  renderDemos?: boolean;
  renderDisclosures?: boolean;
}) {
  const tree: Root = fromHtml(html, { fragment: true });
  markImagesForZoom(tree.children);
  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: {
      ...(headingPrefix
        ? Object.fromEntries(
            ["h2", "h3", "h4", "h5", "h6"].map((tag) => [
              tag,
              ({
                children,
                className,
                ...props
              }: HTMLAttributes<HTMLHeadingElement>) =>
                createElement(
                  tag,
                  {
                    ...props,
                    className: [className, "section-heading-with-prefix"]
                      .filter(Boolean)
                      .join(" "),
                  },
                  headingPrefix,
                  <span className="section-heading-label">{children}</span>,
                ),
            ]),
          )
        : {}),
      details: (
        props: HTMLAttributes<HTMLDetailsElement> & {
          "data-disclosure-icon"?: string;
        },
      ) => {
        if (!renderDisclosures) return <details {...props} />;
        const detailsProps = { ...props };
        delete detailsProps["data-disclosure-icon"];
        const classes = props.className?.split(" ") ?? [];
        const proof = classes.includes("mdx-proof");
        const disclosure = classes.includes("mdx-disclosure");
        const answer = classes.includes("reference-answer");
        if (!proof && !disclosure && !answer) return <details {...props} />;
        const children = Children.toArray(props.children);
        const summary = children.find(
          (child) => isValidElement(child) && child.type === "summary",
        );
        if (!isValidElement<{ children?: ReactNode; lang?: string }>(summary))
          return <details {...props} />;
        const summaryChildren = Children.toArray(summary.props.children);
        type IconSlotProps = {
          children?: ReactNode;
          "data-disclosure-icon-slot"?: string;
        };
        const iconSlot = summaryChildren.find(
          (child) =>
            isValidElement<IconSlotProps>(child) &&
            child.props["data-disclosure-icon-slot"] !== undefined,
        );
        const title = (
          <span lang={summary.props.lang}>
            {summaryChildren.filter((child) => child !== iconSlot)}
          </span>
        );
        const icon = isValidElement<IconSlotProps>(iconSlot) ? (
          iconSlot.props.children
        ) : (
          <Info />
        );
        const content = children.filter((child) => child !== summary);
        if (proof)
          return (
            <ProofDisclosure {...detailsProps} title={title}>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {content}
              </div>
            </ProofDisclosure>
          );
        if (disclosure)
          return (
            <ContentDisclosure {...detailsProps} title={title} icon={icon}>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {content}
              </div>
            </ContentDisclosure>
          );
        return (
          <AnswerDisclosure {...detailsProps} kind="reference">
            {content}
          </AnswerDisclosure>
        );
      },
      section: (
        props: HTMLAttributes<HTMLElement> & {
          "data-learning-problem-set"?: string;
          "data-learning-default-questions"?: string;
        },
      ) => {
        const blockId = props["data-learning-default-questions"];
        if (blockId && renderDefaultQuestions)
          return renderDefaultQuestions(blockId);
        const id = props["data-learning-problem-set"];
        return id && renderProblemSet ? (
          renderProblemSet(id)
        ) : (
          <section {...props} />
        );
      },
      figure: (
        props: HTMLAttributes<HTMLElement> & {
          "data-learning-image-region"?: string;
        },
      ) => {
        const encoded = props["data-learning-image-region"];
        return encoded ? (
          <ImageRegion region={JSON.parse(encoded) as ImageRegionData} />
        ) : (
          <figure {...props} />
        );
      },
      span: (
        props: HTMLAttributes<HTMLSpanElement> & {
          "data-learning-blank"?: string;
        },
      ) => {
        const id = props["data-learning-blank"];
        return id && renderBlank ? renderBlank(id) : <span {...props} />;
      },
      img: (
        props: ImgHTMLAttributes<HTMLImageElement> & {
          "data-image-zoom"?: string;
        },
      ) => {
        const { "data-image-zoom": zoom, ...image } = props;
        return zoom !== undefined ? (
          <ZoomableImage {...image} />
        ) : (
          <NativeImage {...image} />
        );
      },
      div: (
        props: HTMLAttributes<HTMLDivElement> & {
          "data-learning-demo"?: string;
        },
      ) =>
        props["data-learning-demo"] && renderDemos ? (
          <DemoMount id={props["data-learning-demo"]} />
        ) : (
          <div {...props} />
        ),
    },
  });
}
