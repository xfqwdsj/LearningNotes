# 制作交互组件

交互演示按MDX客户端组件编写，并挂载在知识点正文中。位置、路径和元数据身份按 [内容组织与元数据](content.md) 维护；普通Markdown、GFM与内容指令见[Markdown与MDX写法](syntax.md)。

## 放置与表达边界

交互演示在知识点的探索板块中挂载，课程笔记按 [笔记指南](notes.md#选择链接还是引入) 链接或引入该板块。交互组件解释一个具体问题。章节heading提供“交互探索”类型名，组件header写本次要回答的具体问题。

演示根节点使用`not-prose`隔离文章排版，按钮前景色由基础组件的主题变体管理。布局遵守以下边界：

- 容器占满正文列宽，外边距24px；标题区padding为20px / 24px。
- 标题、说明、结论使用零浏览器默认`margin`，顶部位置不受正文排版继承影响。
- 常见阅读顺序是：问题标题 + 状态 → 操作说明 → 响应式画布 → 控件 → 结论条；可按交互本身增减或重排，但应让读者先知道要回答什么，再操作，最后看到状态结论。
- 结论条贴住容器底部，`margin-bottom`为0；容器底部保持零额外空白。
- 画布使用固定`viewBox`和`max-height`；交互状态变化限定在画布内，容器高度与页面布局保持稳定。
- 图中所有数学符号，包括坐标轴、刻度和动态读数，使用KaTeX；轴标签和读数必须避开曲线与数据点。
- 控件要有明确标签、支持键盘与指针操作，并尊重`prefers-reduced-motion`。
- 一个演示只回答一个问题；需要多个问题时拆成多个组件。

范围控件统一使用`src/demos/demo-range.tsx`中的`DemoRange`；单个演示复用共享滑块交互。拖动时拇指连续跟手，跨过语义步长才更新演示值；松手后以缓动停靠到最近步长。相邻步长的像素间距达到10px时，横条会从每个停靠点向上下展开两根次要色短线，并突出当前停靠点；更密集的步长使用无刻度样式。键盘方向键移动一个步长，`Page Up`、`Page Down`或按住`Shift`时移动十个步长。

## 数据与本地化

演示实现为`src/demos/<稳定ID>-demo.tsx`客户端组件，接收`DemoComponentProps`。单一事实源是`src/demos/metadata/<稳定ID>.json`，包含稳定学科ID，以及按语言组织的标题、描述、标签和ICU消息。组件通过`messages`与`locale`读取演示文案，日期和数字使用locale formatter；全局界面包承载通用UI文案。

每个`locales.<语言>`必须完整定义`title`、`description`、`tags`和`messages`。默认语言`zh-CN`必须存在；译文使用相同消息键和ICU参数名。标签是当前译文中的显示内容，支持单行Markdown；学科身份由`subject`提供。例如：

```json
{
  "subject": "maths",
  "locales": {
    "zh-CN": {
      "title": "$F$ 分布有什么特点？",
      "description": "比较不同自由度下的概率密度。",
      "tags": ["概率论", "$F$ 分布"],
      "messages": { "result": "当前自由度为 {value}。" }
    }
  }
}
```

数学符号使用行内公式，例如`$t$ 分布`、`$p$ 值`、`$\Gamma$ 函数`。演示文案中的代码标识符、关键字、命令、路径和代码表达式统一使用行内代码；文章标题和front matter标签遵守相同写法。组件运行时富文本通过`t.markdown()`和`IcuMarkdownText`生成，具体层级见 [演示ICU与Markdown](syntax.md#演示icu与markdown)。

演示说明区的短公式默认行内排版；较长的公式可给`Tex`添加`display`属性（`<Tex source={...} display />`），使用KaTeX展示模式。画布中的数学标注通过`SvgTex`定位，继续使用行内模式。

## 注册与挂载

新增演示时，按顺序完成：

1. 在`src/demos/types.ts`声明稳定的演示ID。
2. 在`src/demos/metadata/<稳定ID>.json`编写默认语言及所有译文。
3. 在`src/demos/catalog.ts`注册元数据。
4. 在`src/components/demo-renderer.tsx`注册按需加载的组件。
5. 在拥有该演示的知识点中通过MDX组件挂载。

RichContent使用通用挂载器。知识点挂载示例：

```mdx
import ContinuityDemo from "@/demos/continuity-demo";

## 交互探索

::section{#exploration slot="knowledge.exploration"}

<ContinuityDemo />
```

同一个演示只能由一个知识点页面拥有，并可在该页面内出现一次；拥有它的知识点页面自动成为演示来源。课程笔记、文章或目录说明可引入或链接该知识点，但只记录为其他引用位置。重复挂载、同一演示出现在多个知识点页面，或演示只出现在非知识点页面时，内容生成会失败并指出演示ID与页面。

演示说明保留脱离交互也能理解的问题、条件和必要结论。Markdown导出提供静态可读内容；交互由网页提供。演示发现、详情文件和首页加载方式见 [首页与演示](../operations.md#首页与演示)。

## SSR与SVG数值

交互演示参与服务端渲染；控件在hydration前禁用，状态变化只在客户端发生。服务端和浏览器会分别执行初始渲染，因此由`Math.sin`、`Math.cos`、`Math.exp`、`Math.log`或概率密度计算出的SVG数值可能产生末位差异，并被React视为属性不一致。

所有会进入SVG数值属性的计算结果必须在输出边界调用 [公共舍入函数](../../src/demos/svg.ts)：

```tsx
import { roundSvgNumber } from "./svg";

const sx = (x: number) => roundSvgNumber(230 + x * 43);
const sy = (y: number) => roundSvgNumber(205 - 160 * Math.exp(-y));
```

规则适用于`points`、`d`，以及计算得到的`x`、`y`、`x1`、`y1`、`x2`、`y2`、`cx`、`cy`、`r`、宽度和高度。由这些数值继续进行的同一坐标转换在上层函数中统一舍入。三维投影、曲线采样、固定装饰坐标和带小数的`viewBox`遵守同一边界；整数常量直接使用。

函数固定到三位小数，面向显示坐标；语义数值、题目答案和TeX内容保持原始精度。公式、标签、ARIA文本和状态说明使用locale formatter。三位小数在当前画布尺寸下保留视觉精度，并使服务端和浏览器的末位差异极难跨过舍入边界。

逐位一致性在数值远离舍入边界且数学库版本稳定时成立。需要硬保证时，由一侧生成并序列化完整几何、将同一字符串传给另一侧，或将动态图形限制为hydration后渲染；Node或浏览器版本变化时重新验证结果。

## 验收

除类型检查、lint和单元测试外，还要检查实际页面的初始SSR、hydration后交互、键盘操作、减少动态效果、窄屏布局、公式、Markdown降级和来源链接。运行开发服务器并观察浏览器控制台，确认没有hydration mismatch；开发模式提供React的完整属性差异诊断，生产构建提供最终输出验证。
