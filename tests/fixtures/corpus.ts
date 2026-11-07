import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoIds, type DemoId } from "@/demos/types";
import { prepare } from "../../scripts/prepare";

type FixtureDocument = {
  path: string;
  title: string;
  body: string;
  description?: string;
  order?: number;
};

type FixtureSuite = "vitest" | "browser" | "dev";

export const fixtureBlankPlaceholder =
  "填写英文单词，并完整保留题目要求的拼写、大小写、空格、标点和格式信息，不要添加额外内容";

const demoPages = [
  [
    "knowledge/cs/computer-architecture/fixture-function-call-stack",
    "recursion-stack",
  ],
  ["knowledge/cs/data-representation/fixture-floating-point", "float"],
  [
    "knowledge/cs/data-representation/fixture-number-base-conversion",
    "radix-place",
  ],
  [
    "knowledge/cs/data-representation/fixture-twos-complement",
    "signed-integer",
  ],
  ["knowledge/cs/operating-systems/fixture-process", "process-state"],
  [
    "knowledge/cs/programming/c/fixture-operator-precedence",
    "c-pointer-precedence",
  ],
  ["knowledge/cs/programming/c/fixture-pointers-arrays", "pointer-arithmetic"],
  [
    "knowledge/cs/programming/fixture-operator-precedence",
    "precedence-comparison",
  ],
  ["knowledge/cs/programming/python/fixture-mutability", "python-mutability"],
  [
    "knowledge/cs/programming/python/fixture-operator-precedence",
    "python-power",
  ],
  ["knowledge/cs/programming/python/fixture-sequences", "python-slice"],
  [
    "knowledge/maths/analytic-geometry/fixture-cylinder-surface",
    "cylinder-surface",
  ],
  ["knowledge/maths/analytic-geometry/fixture-dot-product", "dot-product"],
  ["knowledge/maths/analytic-geometry/fixture-line-in-space", "space-line"],
  ["knowledge/maths/analytic-geometry/fixture-mixed-product", "mixed-product"],
  ["knowledge/maths/analytic-geometry/fixture-quadrics", "quadric-section"],
  [
    "knowledge/maths/analytic-geometry/fixture-revolution-surface",
    "revolution-surface",
  ],
  [
    "knowledge/maths/analytic-geometry/fixture-space-curves",
    "curve-projection",
  ],
  [
    "knowledge/maths/analytic-geometry/fixture-vector-products",
    "vector-product",
  ],
  ["knowledge/maths/analytic-geometry/fixture-vectors", "vector-addition"],
  ["knowledge/maths/derivatives/fixture-cauchy-mean-value", "cauchy-mean"],
  ["knowledge/maths/derivatives/fixture-chain-rule", "chain-rule"],
  ["knowledge/maths/derivatives/fixture-derivative", "derivative"],
  ["knowledge/maths/derivatives/fixture-differential", "differential-approx"],
  [
    "knowledge/maths/derivatives/fixture-implicit-differentiation",
    "implicit-slope",
  ],
  [
    "knowledge/maths/derivatives/fixture-inverse-function-derivative",
    "inverse-derivative",
  ],
  ["knowledge/maths/derivatives/fixture-mean-value-theorems", "lagrange-mean"],
  [
    "knowledge/maths/derivatives/fixture-parametric-derivative",
    "parametric-slope",
  ],
  ["knowledge/maths/derivatives/fixture-rolle-theorem", "rolle"],
  ["knowledge/maths/derivatives/fixture-taylor-formula", "taylor"],
  [
    "knowledge/maths/differential-equations/fixture-differential-equation-basics",
    "ode-solution",
  ],
  [
    "knowledge/maths/differential-equations/fixture-homogeneous-differential-equation",
    "homogeneous-ode",
  ],
  [
    "knowledge/maths/differential-equations/fixture-separable-differential-equation",
    "separable-ode",
  ],
  ["knowledge/maths/integrals/fixture-area-between-curves", "between-curves"],
  ["knowledge/maths/integrals/fixture-definite-integral", "riemann"],
  [
    "knowledge/maths/integrals/fixture-definite-integral-computation",
    "integral-symmetry",
  ],
  [
    "knowledge/maths/integrals/fixture-fundamental-theorem-of-calculus",
    "upper-integral",
  ],
  ["knowledge/maths/integrals/fixture-gamma-function", "gamma-recurrence"],
  ["knowledge/maths/integrals/fixture-improper-integral", "improper-p"],
  ["knowledge/maths/integrals/fixture-integration-applications", "element-sum"],
  ["knowledge/maths/integrals/fixture-integration-by-parts", "parts-boundary"],
  [
    "knowledge/maths/integrals/fixture-integration-by-substitution",
    "substitution-limits",
  ],
  ["knowledge/maths/integrals/fixture-newton-leibniz", "newton-leibniz"],
  ["knowledge/maths/integrals/fixture-solid-of-revolution", "solid-disk"],
  ["knowledge/maths/integrals/fixture-variable-force-work", "variable-work"],
  ["knowledge/maths/integrals/fixture-wallis-formula", "wallis-integral"],
  ["knowledge/maths/limits/fixture-continuity", "continuity"],
  ["knowledge/maths/limits/fixture-discontinuity", "discontinuity"],
  ["knowledge/maths/limits/fixture-equivalent-infinitesimals", "infinitesimal"],
  ["knowledge/maths/limits/fixture-important-limits", "sine-limit"],
  [
    "knowledge/maths/limits/fixture-power-exponential-function",
    "power-exponential",
  ],
  [
    "knowledge/maths/line-integrals/fixture-boundary-orientation",
    "boundary-orientation",
  ],
  [
    "knowledge/maths/line-integrals/fixture-greens-theorem",
    "green-circulation",
  ],
  [
    "knowledge/maths/line-integrals/fixture-line-integral-arc-length",
    "arc-integral",
  ],
  [
    "knowledge/maths/line-integrals/fixture-line-integral-coordinates",
    "vector-line",
  ],
  [
    "knowledge/maths/line-integrals/fixture-path-independence",
    "path-independent",
  ],
  ["knowledge/maths/multiple-integrals/fixture-double-integral", "double-sum"],
  [
    "knowledge/maths/multiple-integrals/fixture-double-integral-computation",
    "cartesian-region",
  ],
  [
    "knowledge/maths/multiple-integrals/fixture-iterated-integral",
    "iterated-slices",
  ],
  [
    "knowledge/maths/multiple-integrals/fixture-polar-double-integral",
    "polar-area",
  ],
  ["knowledge/maths/multiple-integrals/fixture-triple-integral", "triple-box"],
  [
    "knowledge/maths/multiple-integrals/fixture-triple-integral-cartesian",
    "triple-slice",
  ],
  [
    "knowledge/maths/multiple-integrals/fixture-triple-integral-cylindrical",
    "cylindrical-volume",
  ],
  [
    "knowledge/maths/multiple-integrals/fixture-triple-integral-spherical",
    "spherical-volume",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-constrained-extrema",
    "lagrange-multiplier",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-differential-geometry-applications",
    "vector-function",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-directional-derivative-gradient",
    "directional-rate",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-global-extrema",
    "global-extrema",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-implicit-function-theorem",
    "implicit-surface",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-multivariable-chain-rule",
    "multivariable-chain",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-multivariable-continuity",
    "multivariable-continuity",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-multivariable-extrema",
    "local-extrema",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-multivariable-functions",
    "multivariable-domain",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-multivariable-limit",
    "multivariable-limit",
  ],
  ["knowledge/maths/multivariable-calculus/fixture-point-sets", "point-set"],
  [
    "knowledge/maths/multivariable-calculus/fixture-space-curve-tangent",
    "curve-tangent",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-surface-tangent-plane",
    "surface-tangent",
  ],
  [
    "knowledge/maths/multivariable-calculus/fixture-total-differential",
    "total-differential",
  ],
  ["knowledge/maths/probability/fixture-bayes-theorem", "bayes"],
  [
    "knowledge/maths/probability/fixture-central-limit-theorem",
    "central-limit",
  ],
  [
    "knowledge/maths/probability/fixture-conditional-probability",
    "conditional-dice",
  ],
  [
    "knowledge/maths/probability/fixture-continuous-distributions",
    "density-area",
  ],
  ["knowledge/maths/probability/fixture-event-partition", "event-partition"],
  [
    "knowledge/maths/probability/fixture-indicator-variable",
    "indicator-tosses",
  ],
  ["knowledge/maths/probability/fixture-random-events", "event-operations"],
  [
    "knowledge/maths/series/fixture-absolute-convergence",
    "absolute-convergence",
  ],
  ["knowledge/maths/series/fixture-cauchy-product", "cauchy-product"],
  ["knowledge/maths/series/fixture-series-convergence-tests", "p-series-test"],
  ["knowledge/maths/statistics/fixture-f-distribution", "f-ratio"],
  ["knowledge/maths/statistics/fixture-moment-estimation", "moment-estimate"],
  ["knowledge/maths/statistics/fixture-one-sample-tests", "one-mean-test"],
  [
    "knowledge/maths/statistics/fixture-one-sample-variance-test",
    "one-variance-test",
  ],
  ["knowledge/maths/statistics/fixture-p-value", "p-value"],
  [
    "knowledge/maths/statistics/fixture-sampling-distributions",
    "sampling-mean",
  ],
  ["knowledge/maths/statistics/fixture-t-distribution", "t-construction"],
  ["knowledge/maths/statistics/fixture-two-sample-tests", "two-mean-test"],
  ["knowledge/maths/statistics/fixture-upper-tail-quantile", "quantile-tail"],
  ["knowledge/maths/trigonometry/fixture-angle-transformations", "angle-sum"],
  ["knowledge/maths/trigonometry/fixture-angles-and-functions", "unit-circle"],
  ["knowledge/maths/trigonometry/fixture-basic-identities", "trig-identity"],
  [
    "knowledge/maths/trigonometry/fixture-derivatives-integrals",
    "trig-derivative",
  ],
  ["knowledge/maths/trigonometry/fixture-inverse-functions", "inverse-trig"],
  ["knowledge/maths/trigonometry/fixture-reduction-formulas", "trig-reduction"],
] as const satisfies readonly (readonly [string, DemoId])[];

const subjects = {
  maths: {
    title: "数学",
    description: "固定测试分类。",
    icon: "sigma",
    courses: {
      "higher-mathematics": "高等数学",
      "prob-stat": "概率统计",
      "linear-algebra": "线性代数",
    },
  },
  cs: {
    title: "计算机",
    description: "固定测试分类。",
    icon: "cpu",
    courses: { csintro: "计算机基础" },
  },
  circuits: {
    title: "电路",
    description: "固定测试分类。",
    icon: "circuit-board",
    courses: { "digital-analog-circuits": "电路基础" },
  },
  english: {
    title: "英语",
    description: "固定测试分类。",
    icon: "book-open",
    courses: { "university-english": "大学英语" },
  },
  general: {
    title: "通识",
    description: "固定测试分类。",
    icon: "book-open",
    courses: {},
  },
} as const;

const longParagraph =
  "这段固定样例用于让阅读页拥有稳定的滚动长度，并为目录、进度和悬浮栏交互提供可重复的内容。".repeat(
    5,
  );

function defaultTitle(contentPath: string): string {
  const slug = path.posix.basename(contentPath);
  return `样例页面 ${slug}`;
}

function knowledgeBody(demo?: DemoId): string {
  return `## 定义
::section{#definition slot="knowledge.definition"}

这是固定测试夹具中的说明段落。

### 示例子项

这里提供一个稳定的子标题。

## 性质
::section{#properties slot="knowledge.properties"}

${longParagraph}

## 例子
::section{#examples slot="knowledge.examples"}

这是供阅读和摘要测试使用的示例段落。

## 探索
::section{#exploration slot="knowledge.exploration"}

${demo ? `::demo{name="${demo}"}` : "这里没有交互演示。"}

> [!NOTE]
> **观察什么**
>
> 固定样例提示。
`;
}

function continuityBody(): string {
  return `## 定义
::section{#definition slot="knowledge.definition"}

夹具检索词用于验证搜索和摘要，不从站点正文读取。

### 区间上的连续性

这是用于验证被引用子标题的合成段落。

$$
\\lim_{x \\to x_0} f(x) = f(x_0)
$$

> [!NOTE]
> **观察什么**
>
> 固定样例提示。

## 性质
::section{#properties slot="knowledge.properties"}

这是性质段落。

## 例子
::section{#examples slot="knowledge.examples"}

这是示例段落。

## 练习
::problems{#continuity-check}

1. ::question{#absolute}

   示例题面：结合左右极限与函数值作出判断。

   1. ::part{#continuity}

      单选题：:choice-slot{}选择正确结论。

      :::choices{#single mode="single"}
      * :option[A]{#yes} 选项一。
      * :option[B]{#no} 选项二。
      :::

      :::reference
      ::correct{option="yes"}
      :::

   2. ::part{#properties number="3"}

      多选题：选择两个正确选项。

      :::choices{#multiple mode="multiple"}
      * :option[A]{#a} 选项一。
      * :option[B]{#b} 选项二。
      * :option[C]{#c} 选项三。
      :::

      :::reference
      ::correct{option="a"}
      ::correct{option="c"}
      :::

   3. ::part{#value}

      数值题：填写零。

      :blank{#answer type="number"}

      :::reference
      ::correct{blank="answer" value="0"}

      固定参考解答：数值为零。
      :::

## 探索
::section{#exploration slot="knowledge.exploration"}

这是固定的探索段落。

::demo{name="continuity"}
`;
}

function courseBody(contentPath: string): string {
  if (contentPath === "courses/maths/higher-mathematics/fixture-1.8")
    return `## 引用来源

::knowledge{path="maths/limits/fixture-continuity" slot="definition"}

## 长页示例

${longParagraph}
`;
  if (contentPath === "courses/cs/csintro/fixture-4.1")
    return `## 引用来源

::knowledge{path="cs/programming/python/fixture-sequences" slot="properties"}

## 练习阅读

${longParagraph}
`;
  if (contentPath === "courses/maths/prob-stat/fixture-6.2")
    return `## 来源说明

::knowledge{path="maths/statistics/fixture-f-distribution" slot="definition"}

## 例子

固定课程内容。
`;
  if (contentPath.endsWith("/fixture-4.3"))
    return Array.from(
      { length: 10 },
      (_, index) => `## 阅读段落 ${index + 1}\n\n${longParagraph}\n`,
    ).join("\n");
  if (contentPath.endsWith("/fixture-1.8"))
    return Array.from(
      { length: 8 },
      (_, index) => `## 阅读段落 ${index + 1}\n\n${longParagraph}\n`,
    ).join("\n");
  if (contentPath.endsWith("/fixture-7.3"))
    return Array.from(
      { length: 10 },
      (_, index) => `## 阅读段落 ${index + 1}\n\n${longParagraph}\n`,
    ).join("\n");
  return `## 课程示例

${longParagraph}

## 第二部分

这是另一段固定课程样例。
`;
}

function privateQuestionBody(setId: string, questions: string): string {
  return `## 测试题集
::problems{#${setId}}

${questions}
`;
}

function privateDocuments(): FixtureDocument[] {
  const assignmentPath = "tasks/maths/higher-mathematics/assignment";
  const summary = [
    "### 样例日期",
    "2026/11/02 20:00",
    "",
    "### 摘要正文",
    ...Array.from({ length: 7 }, () => longParagraph),
    "![摘要图片一](https://fixture.invalid/summary-one.svg)",
    "![摘要图片二](https://fixture.invalid/summary-two.svg)",
  ].join("\n\n");
  return [
    {
      path: `${assignmentPath}/fixture-summary`,
      title: "任务摘要示例",
      description: summary,
      body: `## 任务正文示例\n\n正文内容不进入摘要。\n`,
    },
    {
      path: `${assignmentPath}/fixture-input`,
      title: "填空交互示例",
      body: privateQuestionBody(
        "set-2",
        `1. ::question{#q1}\n\n   这是第一题。\n\n2. ::question{#q2 number="2"}\n\n   请填写一个单词：:blank{#word type="text" placeholder="${fixtureBlankPlaceholder}"}。\n`,
      ),
    },
    {
      path: `${assignmentPath}/fixture-pages`,
      title: "分页题面示例",
      body: privateQuestionBody(
        "page-set",
        `::page{number="42"}\n\n1. ::question{#q1 number="1"}\n\n   ::include{src="/knowledge/maths/limits/fixture-continuity/" section="definition"}\n\n::page{number="43"}\n\n2. ::question{#q2 number="2"}\n\n   第二题。\n\n::page{number="44"}\n\n3. ::question{#q3 number="3"}\n\n   第三题。\n`,
      ),
    },
    {
      path: "tasks/circuits/digital-analog-circuits/assignment/fixture-nested",
      title: "分层题目示例",
      body: privateQuestionBody(
        "logic-set",
        `1. ::question{#q1 number="1.8"}\n\n   测试题面：父级题目。\n\n   1. ::part{#p1 number="1"}\n\n      子项题面：answer = 1。\n\n      :blank{#answer type="text"}\n\n2. ::question{#q2 number="1.9"}\n\n   测试题面：包含两个子项。\n\n   1. ::part{#p1 number="2"}\n\n      第一子项。\n\n      :blank{#first type="text"}\n\n   2. ::part{#p2 number="4"}\n\n      第二子项。\n\n      :blank{#second type="text"}\n\n3. ::question{#q3 number="1.16"}\n\n   第三题：:blank{#third type="text"}\n\n4. ::question{#q4 number="1.17"}\n\n   第四题：:blank{#fourth type="text"}\n`,
      ),
    },
    {
      path: "tasks/maths/higher-mathematics/exercise/fixture-image",
      title: "夹具图片练习",
      body: privateQuestionBody(
        "image-set",
        `1. ::question{#image-question}\n\n   图片题面示例。\n\n   ![测试图片](https://fixture.invalid/1.jpg)\n\n   :blank{#answer type="text"}\n`,
      ),
    },
    {
      path: "tasks/maths/linear-algebra/assignment/fixture-number-a",
      title: "题号示例甲",
      body: privateQuestionBody(
        "number-set",
        `1. ::question{#q1 number="1"}\n\n   第一题。\n\n2. ::question{#q2 number="2"}\n\n   第二题。\n\n3. ::question{#q3 number="4"}\n\n   第三题。\n`,
      ),
    },
    {
      path: "tasks/maths/linear-algebra/assignment/fixture-number-b",
      title: "题号示例乙",
      body: privateQuestionBody(
        "number-set",
        `1. ::question{#q1 number="1"}\n\n   第一题。\n\n2. ::question{#q2 number="3"}\n\n   第二题。\n`,
      ),
    },
    {
      path: "tasks/maths/linear-algebra/assignment/fixture-groups",
      title: "分组题集示例",
      body: `## 第一组
::problems{#first-set}

1. ::question{#q1 number="3"}

   第一组第一题。

2. ::question{#q2 number="4"}

   第一组第二题。

## 第二组
::problems{#second-set}

1. ::question{#q1 number="1"}

   第二组第一题。

2. ::question{#q2 number="2"}

   第二组第二题。
`,
    },
    {
      path: "tasks/maths/linear-algebra/assignment/fixture-slots",
      title: "任务槽位示例",
      body: `## 题目
::section{#fixture-problems slot="task.problems"}

### 固定题集

::section{#fixture-slot-set}

::problems{#fixture-slot-set-data}

1. ::question{#fixture-slot-question}

   任务槽位题面。

## 条件
::section{#fixture-constraints slot="task.constraints"}

固定条件。

## 我的作答
::section{#fixture-work slot="task.work"}

固定作答。

## 参考解答
::section{#fixture-reference slot="task.reference"}

固定参考解答。

## 反馈
::section{#fixture-feedback slot="task.feedback"}

::problems{#fixture-feedback-set}

1. ::question{#fixture-feedback-question}

   任务反馈题面。

## 订正
::section{#fixture-correction slot="task.correction"}

固定订正。

## 勘误
::section{#fixture-errata slot="task.errata"}

固定勘误。

## 附件
::section{#fixture-attachments slot="task.attachments"}

固定附件说明。

${Array.from(
  { length: 6 },
  (_, index) => `### 附件补充 ${index + 1}\n\n${longParagraph}`,
).join("\n\n")}
`,
    },
    {
      path: "tasks/maths/linear-algebra/assignment/fixture-search",
      title: "夹具分类检索",
      description: [
        "### 延迟图片摘要",
        "![动态折叠高度](https://fixture.invalid/summary-growth.svg)",
      ].join("\n\n"),
      body: `## 任务内容\n\n固定测试任务。\n`,
    },
    {
      path: "tasks/english/university-english/assignment/fixture-scroll",
      title: "滚动测试任务",
      body: Array.from(
        { length: 10 },
        (_, index) => `## 固定滚动段落 ${index + 1}\n\n${longParagraph}`,
      ).join("\n\n"),
    },
  ];
}

const baseDocuments: FixtureDocument[] = [
  {
    path: "knowledge/maths/limits/fixture-continuity",
    title: "示例知识点",
    description: "夹具检索词用于测试搜索摘要。",
    body: continuityBody(),
  },
  {
    path: "knowledge/cs/data-representation/fixture-number-base-conversion",
    title: "代码展示示例",
    body: `${knowledgeBody("radix-place")}
${Array.from(
  { length: 18 },
  (_, index) => `## 补充段落 ${index + 1}\n\n${longParagraph}`,
).join("\n\n")}

\`\`\`python title="示例代码.py" {1} ins={2} startLineNumber=5
b = 10
print(b)
\`\`\`
`,
  },
  {
    path: "knowledge/maths/integrals/fixture-integral-formulas",
    title: "公式排版示例",
    body: `${knowledgeBody()}\n\n$$\n\\frac{\\arctan(x^2)}{1+x^2}\n$$\n`,
  },
  {
    path: "knowledge/maths/multivariable-calculus/fixture-implicit-function-theorem",
    title: "组织结构示例",
    body: `## 定义
::section{#definition slot="knowledge.definition"}

定义示例。

## 条件
::section{#conditions slot="knowledge.properties"}

条件示例。

## 推导
::section{#derivation slot="knowledge.proof"}

推导示例。

## 例子
::section{#one-variable}

一元示例 $F$。

## 二元
::section{#two-variables}

二元示例 $F$。

## 系统
::section{#system}

系统示例 $F$。
`,
  },
  {
    path: "knowledge/maths/statistics/fixture-variance-ratio-confidence-interval",
    title: "$F$ 区间示例",
    description: "摘要公式 $F^2$。",
    body: knowledgeBody(),
  },
  {
    path: "knowledge/maths/statistics/fixture-f-distribution",
    title: "$F$ 分布示例",
    description: "摘要公式 $F^2$。",
    body: knowledgeBody(),
  },
  {
    path: "knowledge/maths/statistics/fixture-t-distribution",
    title: "$t$ 分布示例",
    description: "摘要公式 $t^2$。",
    body: knowledgeBody(),
  },
  {
    path: "knowledge/maths/statistics/fixture-p-value",
    title: "$p$ 值示例",
    description: "摘要公式 $p^2$。",
    body: knowledgeBody(),
  },
  {
    path: "knowledge/maths/integrals/fixture-gamma-function",
    title: "$\\Gamma$ 函数示例",
    description: "摘要公式 $\\Gamma^2$。",
    body: knowledgeBody(),
  },
  {
    path: "knowledge/cs/programming/fixture-operator-precedence",
    title: "运算符目录页示例",
    body: knowledgeBody(),
  },
  {
    path: "knowledge/cs/programming/c/fixture-operator-precedence",
    title: "C 运算符优先级",
    body: knowledgeBody("c-pointer-precedence"),
  },
  {
    path: "knowledge/cs/programming/c/fixture-pointers-arrays",
    title: "C 指针数组示例",
    body: knowledgeBody("pointer-arithmetic"),
  },
  {
    path: "knowledge/cs/programming/python/fixture-operator-precedence",
    title: "Python 运算符优先级",
    body: knowledgeBody("python-power"),
  },
  {
    path: "knowledge/cs/programming/python/fixture-sequences",
    title: "序列切片示例",
    body: `## 定义
::section{#definition slot="knowledge.definition"}

固定列表示例。

## 性质
::section{#properties slot="knowledge.properties"}

### 步长决定方向和间隔

这是用于验证引用后子标题的固定样例。

## 探索
::section{#exploration slot="knowledge.exploration"}

::demo{name="python-slice"}
`,
  },
  {
    path: "articles/fixture-connected-learning",
    title: "文章引用示例",
    body: `## 引用内容

::include{src="/knowledge/maths/limits/fixture-continuity/" section="definition"}

这是引用后的固定文字。
`,
  },
  {
    path: "articles/fixture-notes",
    title: "附加文章示例",
    body: `## 内容\n\n这是另一个固定页面，用于测试文章列表。\n`,
  },
  {
    path: "courses/maths/higher-mathematics/fixture-1.5",
    title: "层级导航示例",
    order: 1,
    description: "章节摘要。",
    body: courseBody("courses/maths/higher-mathematics/fixture-1.5"),
  },
  {
    path: "courses/maths/higher-mathematics/fixture-1.8",
    title: "引用来源示例",
    order: 2,
    description: "章节摘要。",
    body: courseBody("courses/maths/higher-mathematics/fixture-1.8"),
  },
  {
    path: "courses/maths/higher-mathematics/fixture-4.3",
    title: "阅读交互示例",
    order: 3,
    description: "章节摘要。",
    body: courseBody("courses/maths/higher-mathematics/fixture-4.3"),
  },
  {
    path: "courses/maths/higher-mathematics/fixture-5.4",
    title: "数学摘要示例",
    order: 4,
    description: "公式摘要 $\\alpha^2$。",
    body: courseBody("courses/maths/higher-mathematics/fixture-5.4"),
  },
  {
    path: "courses/maths/higher-mathematics/fixture-7.3",
    title: "阅读末项示例",
    order: 5,
    description: "章节摘要。",
    body: courseBody("courses/maths/higher-mathematics/fixture-7.3"),
  },
  {
    path: "courses/maths/higher-mathematics/fixture-8.1",
    title: "自然排序示例八",
    order: 6,
    description: "章节摘要。",
    body: courseBody("courses/maths/higher-mathematics/fixture-8.1"),
  },
  {
    path: "courses/maths/higher-mathematics/fixture-10.1",
    title: "自然排序示例十",
    order: 7,
    description: "章节摘要。",
    body: courseBody("courses/maths/higher-mathematics/fixture-10.1"),
  },
  {
    path: "courses/maths/higher-mathematics/fixture-11.1",
    title: "移动布局示例",
    order: 8,
    description: "章节摘要。",
    body: courseBody("courses/maths/higher-mathematics/fixture-11.1"),
  },
  {
    path: "courses/cs/csintro/fixture-4.1",
    title: "引用子标题示例",
    body: courseBody("courses/cs/csintro/fixture-4.1"),
  },
  {
    path: "courses/cs/csintro/fixture-6.5",
    title: "课程章节示例",
    body: courseBody("courses/cs/csintro/fixture-6.5"),
  },
  {
    path: "courses/maths/prob-stat/fixture-6.2",
    title: "Markdown 标题来源示例",
    body: courseBody("courses/maths/prob-stat/fixture-6.2"),
  },
];

const demoDocuments: FixtureDocument[] = demoPages
  .filter(
    ([contentPath]) =>
      contentPath !== "knowledge/maths/limits/fixture-continuity",
  )
  .map(([contentPath, demo]) => ({
    path: contentPath,
    title:
      contentPath === "knowledge/cs/programming/c/fixture-operator-precedence"
        ? "C 运算符优先级"
        : contentPath ===
            "knowledge/cs/programming/python/fixture-operator-precedence"
          ? "Python 运算符优先级"
          : defaultTitle(contentPath),
    body: knowledgeBody(demo),
  }));

const allMappedDemos = new Set<DemoId>(demoPages.map(([, id]) => id));
const additionalDemos = demoIds.filter((id) => !allMappedDemos.has(id));
const demoCatalogDocument: FixtureDocument = {
  path: "knowledge/general/fixture-demo-catalog",
  title: "演示目录夹具",
  order: 9999,
  body: `## 演示目录
::section{#exploration slot="knowledge.exploration"}

${additionalDemos.map((id) => `::demo{name="${id}"}`).join("\n\n")}
`,
};

function courseDescription(contentPath: string): string | undefined {
  if (contentPath === "courses/maths/higher-mathematics/fixture-5.4")
    return "公式摘要 $\\alpha^2$。";
  return undefined;
}

function buildPublicDocuments(): FixtureDocument[] {
  const demosByPath = new Map<string, DemoId>(demoPages);
  const documents = new Map<string, FixtureDocument>();
  for (const doc of demoDocuments) documents.set(doc.path, doc);
  for (const doc of baseDocuments) {
    const demo = demosByPath.get(doc.path);
    const directive = demo ? `::demo{name="${demo}"}` : "";
    let body = doc.body;
    if (directive && !body.includes(directive)) {
      body = body.includes("这里没有交互演示。")
        ? body.replace("这里没有交互演示。", directive)
        : `${body}\n\n## 探索\n::section{#fixture-exploration slot="knowledge.exploration"}\n\n${directive}\n`;
    }
    const description =
      doc.description ??
      (doc.path.startsWith("knowledge/maths/statistics/") ||
      doc.path === "knowledge/maths/integrals/fixture-gamma-function"
        ? "公式摘要 $x^2$。"
        : courseDescription(doc.path));
    documents.set(doc.path, {
      ...doc,
      body,
      ...(description ? { description } : {}),
    });
  }
  return [...documents.values(), demoCatalogDocument];
}

function frontMatter(values: Record<string, unknown>): string {
  return `---\n${Object.entries(values)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n")}\n---\n\n`;
}

function taxonomyTermFrontMatter(
  title: string,
  description: string,
  icon?: string,
): string {
  return frontMatter({ title, description, ...(icon ? { icon } : {}) });
}

function subjectTermDirectories(): string[] {
  return Object.entries(subjects).flatMap(([subject, data]) => [
    `subjects/${subject}`,
    ...Object.keys(data.courses).map(
      (course) => `subjects/${subject}/${course}`,
    ),
  ]);
}

function documentDirectories(
  documents: FixtureDocument[],
  privateContent: boolean,
): Set<string> {
  const directories = privateContent
    ? new Set(["", "tasks"])
    : new Set(["", "subjects", "courses", "knowledge", "tasks", "articles"]);
  if (!privateContent)
    for (const termDirectory of subjectTermDirectories())
      directories.add(termDirectory);
  for (const document of documents) {
    let directory = path.posix.dirname(document.path);
    while (directory !== ".") {
      directories.add(directory);
      directory = path.posix.dirname(directory);
    }
  }
  return directories;
}

function isTaxonomyDirectory(directory: string): boolean {
  const parts = directory.split("/");
  if (parts[0] === "subjects") return parts.length === 2 || parts.length === 3;
  if (["courses", "knowledge", "tasks"].includes(parts[0] ?? "")) {
    if (parts.length === 2) return true;
    if (["courses", "tasks"].includes(parts[0] ?? "") && parts.length === 3)
      return true;
  }
  return false;
}

function directoryFrontMatter(directory: string): string {
  if (isTaxonomyDirectory(directory)) return frontMatter({});
  const rootMetadata: Record<string, { title: string; description: string }> = {
    "": { title: "固定内容根目录", description: "固定测试根目录。" },
    subjects: { title: "学科", description: "固定测试分类入口。" },
    courses: { title: "课程资料", description: "固定测试课程入口。" },
    knowledge: { title: "知识点", description: "固定测试知识入口。" },
    tasks: { title: "学习任务", description: "固定测试任务入口。" },
    articles: { title: "文章与笔记", description: "固定测试文章入口。" },
  };
  const metadata = rootMetadata[directory] ?? {
    title: `样例目录 ${path.posix.basename(directory)}`,
    description: "固定测试目录说明。",
  };
  return frontMatter(metadata);
}

async function writeContentTree(
  contentDirectory: string,
  documents: FixtureDocument[],
  privateContent: boolean,
): Promise<void> {
  await rm(contentDirectory, { recursive: true, force: true });
  for (const directory of documentDirectories(documents, privateContent)) {
    const file = path.join(contentDirectory, directory, "_index.mdx");
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, directoryFrontMatter(directory));
  }
  if (!privateContent) {
    for (const [subject, data] of Object.entries(subjects)) {
      const writeTerm = async (
        directory: string,
        title: string,
        description: string,
        icon?: string,
      ) => {
        const termFile = path.join(contentDirectory, directory, "_index.mdx");
        await mkdir(path.dirname(termFile), { recursive: true });
        await writeFile(
          termFile,
          taxonomyTermFrontMatter(title, description, icon) +
            `固定分类简介。${icon ? "" : " 示例课程介绍。"}\n`,
        );
      };
      await writeTerm(
        `subjects/${subject}`,
        data.title,
        data.description,
        data.icon,
      );
      for (const [course, courseTitle] of Object.entries(data.courses))
        await writeTerm(
          `subjects/${subject}/${course}`,
          courseTitle,
          "课程概览示例，正文由测试夹具固定。",
        );
    }
  }
  for (const document of documents) {
    if (!path.posix.basename(document.path).startsWith("fixture-"))
      throw new Error(`Expected a fixture document path: ${document.path}`);
    const file = path.join(contentDirectory, `${document.path}.mdx`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(
      file,
      frontMatter({
        title: document.title,
        ...(document.description ? { description: document.description } : {}),
        ...(document.order === undefined ? {} : { order: document.order }),
      }) + document.body,
    );
  }
}

export function fixtureSuiteRoot(suite: FixtureSuite): string {
  return path.resolve(".dev", "test-fixtures", suite);
}

export async function prepareFixtureSuite(suite: FixtureSuite) {
  const suiteRoot = fixtureSuiteRoot(suite);
  const sourceRoot = path.join(suiteRoot, "source");
  const publicContentDirectory = path.join(sourceRoot, "public", "content");
  const privateContentDirectory = path.join(sourceRoot, "private", "content");
  const generatedRoot = path.join(suiteRoot, "generated");
  const publicDocs = buildPublicDocuments();
  const privateContentDocuments = privateDocuments();

  await writeContentTree(publicContentDirectory, publicDocs, false);
  await writeContentTree(
    privateContentDirectory,
    privateContentDocuments,
    true,
  );
  await prepare({
    outputDirectory: generatedRoot,
    publicContentDirectory,
    privateContentDirectory,
  });
  return {
    suiteRoot,
    sourceRoot,
    publicContentDirectory,
    privateContentDirectory,
    generatedRoot,
  };
}
