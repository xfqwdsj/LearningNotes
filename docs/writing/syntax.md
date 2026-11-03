# Markdown与MDX写法

所有文章和目录说明使用`.mdx`；Markdown用于导出及内部片段渲染。正文支持MDX与remark-directive，文字中的花括号和尖括号按MDX规则转义。站点支持GFM和数学公式，行内可用`$x^2$`或`\(x^2\)`，块级可用`$$`或`\[ ... \]`。代码块内容保持代码文本；货币符号可用`\$`转义。

## 中西文间距

可见文本中的CJK字符与非CJK字母、十进制数字之间不写空格。该规则覆盖仓库Markdown文档、Markdown/MDX正文、front matter中可显示的字符串、界面消息、演示本地化消息、图片替代文本、directive标题和MDX可见属性。

正文边界由AST识别。中文全角点号与成对括号紧贴相邻文字，不额外留分隔空格；`%s`、`.env`、`C++`、`$HOME`、`$x$`、反引号代码与ICU占位符按完整可见对象识别，前置或后置符号不阻断其与CJK之间的边界。代码、公式和链接目标的内部内容不直接改写，Markdown换行和普通西文句内空格保持不变。页面通过全局`text-autospace: normal`恢复视觉空隙，输入区域和`pre`关闭自动间距。检查与写入命令见[开发、索引与部署](../operations.md#开发)。

## 语义板块与引入

标记紧邻heading，ID在页面内唯一、跨译文稳定；普通板块只声明ID。范围到下一个同级或更高级heading。槽位使用显式声明，标题只承担显示文字。

```mdx
## 定义

::section{#definition slot="knowledge.definition"}

这里写定义正文。
```

编写方法见 [知识点指南](knowledge.md) 和 [课程笔记指南](notes.md)。

知识点槽位为`knowledge.definition`、`knowledge.properties`、`knowledge.proof`、`knowledge.examples`、`knowledge.exploration`，任务槽位见 [内容组织](content.md)。所有预定义槽位在标题左侧显示带所属槽位强调色和语义图标的轻量标记，已有标题分隔线同步使用该强调色；标记不改变正文列宽、缩进、字号或背景。特殊heading只渲染显式标记。板块引入省略根标题后，槽位继续属于显式标记的节点，首个子标题保持普通标题语义。每个固定槽位声明一次，槽位所属类型必须与来源页面一致；引入后保留来源类型、语言与语义。

```mdx
::include{src="/courses/maths/higher-mathematics/4.3/" section="integration-by-parts"}

::include{src="/knowledge/maths/limits/continuity/" slot="knowledge.definition"}

::knowledge{path="maths/limits/continuity" slot="definition"}
```

`include`可引入整篇、`section`或`slot`，两个选择器互斥。`knowledge`使用相对`knowledge/`根目录、包含学科与子目录的`path`（不带扩展名），是知识点专属简写，共用解析流程。也可用MDX默认import引入内容。语言按当前来源的内容语言与缺译规则选择；显式语言路由固定该版本。公开内容不能引入私有正文；缺失目标、循环或重复身份使构建失败。

选择板块时省略其根heading；子heading从宿主最近heading的下一层起（无宿主heading则从h2起）保持相对层级，以h6为上限。重复引入的本地锚点和题集ID相互隔离。站点、摘要、索引、搜索和Markdown导出使用同一展开AST，导出保留来源。

引入关系会静态记录来源section与宿主位置。搜索索引收录宿主自己的正文；被引入正文保持来源身份，并在搜索来源section时列出引用它的页面位置。来源section的标题操作中提供“引用位置”菜单，直接使用构建时生成的引用列表。

## 摘要

页面摘要依次选择front matter的`description`、显式标记的heading正文、首个`more`前内容、首段。每篇最多一个摘要标记，放在heading下；与`section`同用时让section紧邻heading，摘要标记随后。

```mdx
## 档案与回顾

::section{#archive slot="task.work"}

{/* summary */}

### 本次记录

记录内容。

{/* more */}

后续正文。
```

摘要从所标记heading的正文开始；下级标题从预览h3起保持相对层级。保留换行、图片和公式，长摘要默认折叠。section索引摘要依次使用`summaries`中显式值、板块`more`前正文、首段。

## 题集、题目与小题

题集由heading开启，到下一个同级或更高级heading结束；heading就是题集名称并启用专属渲染，`::problems`声明稳定的题集ID。若标题也要标记为与来源类型匹配的槽位，在heading后先写`::section`，再紧跟`::problems`；题集徽章会合并该槽位的图标与强调色。板块ID与题集ID独立：前者用于板块锚点，后者用于题目目标和题集状态。题集内部的更深层heading只用于分块，不会另起题集，也不重置题目编号。一个页面可有多个题集。

```mdx
## 习题二

::problems{#set-2}

::page{number="42"}

1. ::question{#q11 number="11"}

   题干。

   1. ::part{#p1}

      第一个小题。

   2. ::part{#p2}

      第二个小题。

### 附加题

2. ::question{#q12 number="12"}

   继续递增编号。
```

同一个heading也可以同时作为`task.problems`板块和题集标题：

```mdx
## 原文

::section{#problems slot="task.problems"}

::problems{#set-1}

1. ::question{#q1}

   题干。
```

题集ID页面内唯一、题目ID题集内唯一、小题ID父题内唯一；关联目标为`set-2/q11/p1`。小题通过父题下一层列表声明，渲染为原生嵌套列表，以`(1)`等marker呈现；数据结构使用递归模型，渲染器按节点树处理。普通嵌套列表保持普通列表语义。题集占据一个heading范围；内部heading保持普通分块语义。

不属于显式题集的题目也可以使用相同的列表项写法。页面内所有这类题目共同归入隐藏的`default`题集，题目目标为`default/<题目ID>`，题目ID在该页面的所有题集外题目中唯一；`default`保留为内部题集ID，不可用于显式题集。关联个人作答或参考解答时，根题目标`for="default/q"`与`for="q"`等价；小题目标也可省略`default/`。若简写与显式题集目标重合，显式目标优先，此时写完整的`default/q/p`可消除歧义。

```mdx
1. ::question{#limit-preview}

   求函数在 $x=0$ 处的极限。

:::work{for="limit-preview"}

这里记录一次试做。

:::

:::reference{for="default/limit-preview"}

这里记录展示用解答。

:::
```

`default`显示题目自身的输入、判分和清空行为；题集标题、整集汇总、题集级递归判分和整集清空由显式题集提供。此写法适用于完全孤立、重要性不高的题目，或演示／展示用途。需要题集编排和题集级操作的正式题目放入显式题集。

`number`是可选的原题号文本。省略时题干直接与列表序号同行；指定时以轻量“原…”标签占一行，和列表序号互不影响。题集主列表、每个父题的小题列表都从1递增，小题以括号编号；`number`保存原题号，列表序号由Markdown顺序生成。

每个内容边界都在右上角提供链接、复制和讨论操作。窄屏或触屏设备把这些操作收成一个菜单，菜单文案随层级变化（本节、题集、本题、整题、本小题）。

`::page{number="42"}`表示从该位置开始的页码，可在题目间或题内出现。题前页码保持在题干容器之外，题内页码随所在内容定位；宽屏轻量右侧标注，窄屏流内显示，不使用分割线。

### 选择、填空和判分

以下内容放在对应题目或小题的缩进范围内：

```mdx
:::choices{#choice mode="multiple"}

- :option[A]{#a} 连续
- :option[B]{#b} 可导
- :option[C]{#c} 极限存在

:::

函数值为 :blank{#value type="number"}。

:::reference

::correct{input="choice" option="a"}

::correct{input="choice" option="c"}

::correct{blank="value" value="0" tolerance="0.001"}

这里写参考解答。

:::
```

`choices`类型为`single`或`multiple`，选项有稳定ID；`A.`等普通文本不会转成选项。`blank`类型为`text`或`number`，一题可有多空；未指定输入的开放题提供文字试做框（输入ID为`response`）。同题多个选项组的判分键必须显式写`input`。

判分键与参考解答内容分别声明。多选比较完整集合；文本执行trim和NFC规范化，可显式`ignore-case="true"`；数值支持十进制、科学计数法，默认精确，可声明绝对`tolerance`。数学等价、证明和翻译等开放答案显示未判分。判分键来自作者声明的`::correct`指令。

检查与清空出现在最终作答单元：没有小题的题目在题末，小题在小题末。含多个小题的父题在父题有独立输入时显示父题操作，小题各自显示操作；单小题题将操作放在外层，并包含父题和小题内容。显式题集底部提供整集检查、整集清空和可判分项汇总；隐藏的`default`题集使用题目级操作。中间层使用同一组操作，避免重复叠加。

草稿按公开／私有、文档、语言、题目身份和题面revision保存在当前浏览器，并提供清空本题及本题集。读取草稿时要求revision与当前题面一致；不一致的草稿保持未载入。存储不可用时，答案保存在本次会话。浏览器草稿保持浏览器状态，正文与公开Markdown导出只包含内容源。

### 个人作答与参考解答

`work` / `reference`位于题内时继承该题，独立记录通过`for`关联；同题可有多份记录。参考解答默认折叠，与证明共用 [折叠呈现](#展示块)。个人订正、反馈、勘误仍使用各自语义槽位。

```mdx
:::work{for="set-2/q11/p1"}

这里写个人作答或图片片段。

:::
```

讨论入口包含题干与当前试做答案，可选择附加参考解答；父题讨论包含其小题。图片传递原图链接和裁剪说明。评估接口在本地执行；BYOK密钥、服务商配置和网络调用属于外层集成契约。

## 图片片段

```mdx
[scan-1]: https://example.com/answer-1.webp
[scan-2]: https://example.com/answer-2.webp

::image-region{image="scan-1" x="5" y="10" width="42" height="30" display-width="24rem"}

::image-region{image="scan-2" x="8" y="5" width="80" height="20" display-width="30rem"}

::image-region{image="scan-1" x="52" y="10" width="42" height="30" display-width="20rem"}
```

坐标相对原图，均为百分比且不得越界；显示宽度支持正值`rem`、`px`、`%`或`auto`。原图可多次独立裁剪、缩放，与其他原图片段按声明顺序交错。可放入明确关联的`work`，未关联的整份档案保持原样。

普通正文图片与裁剪图片共用图片查看器，均有打开和关闭动画。滚轮或单指滑动会触发关闭；关闭动画完成后页面恢复滚动，后续手势可继续阅读。裁剪区域以引用同一原图URL的内联SVG viewBox呈现，放大后仍保持声明的范围和比例，并在题注下提供完整原图链接。浏览器直接加载原图并复用正常缓存、尺寸测量和保存能力；裁剪只保存原图URL与viewBox参数。资源端继续使用普通图片的访问策略。

## Markdown导出

Markdown导出展开所有引入，有序列表从1正常递增，单题标题使用题集内序号（小题使用父题序号与小题序号），原题号保存在正文标签中；同一输入的连续答案声明合并列出，内嵌参考解答复用已有答案行，说明正文保持原有顺序；同时保留题目层级、选项、空位、正文答案和来源；图片导出为原图链接与裁剪参数，网页交互由站点呈现。

## 代码块

代码块使用Expressive Code，默认显示语言和行号。元信息使用其语法：

````mdx
```python title="example.py" {2} /answer/ startLineNumber=1
answer = 42
print(answer)
```
````

可用`showLineNumbers=false`、`startLineNumber=10`、`wrap`、`{1,3-5}`行高亮、`/word/`词高亮、`ins={2}` / `del={3}`差异标注及`diff` / `diff lang="ts"`。复制保留原始代码，不含行号和标题。

## GitHub提示块

使用GitHub alert语法编写提示：

```mdx
> [!NOTE] **观察什么**
>
> 改变点上的函数值不会改变邻近点趋近时的极限。
```

支持`NOTE`、`TIP`、`IMPORTANT`、`WARNING`、`CAUTION`五种类型；标题由类型自动本地化，导出Markdown保留`[!TYPE]`语法。提示块使用sans正文和独立内边距；最后一个子元素的底部`margin`为0，容器底部保持零额外空白。

## 展示块

局部例子、证明、通用折叠和步骤使用容器标记：

```mdx
::::example{title="检验 $f(x)=x^2$"}

这里写例子，可以使用公式、图片或题目。

:::proof{title="二次函数的导数"}

这里写证明，默认折叠，点击标题展开。

:::

::::

:::steps

1. **确定条件**

   写出已知量和所需条件。

2. **计算并检验**

   计算结果，回代检验。

:::

:::disclosure{icon="lightbulb" title="补充说明"}

通用折叠用于补充解释、取舍说明等非证明内容。

:::
```

`example`和`proof`的可选`title`支持行内Markdown与公式。`proof`的`title`是固定“证明”标签后的子标题，例如`title="二次函数的导数"`呈现为“证明 二次函数的导数”；省略时只显示“证明”。`proof`使用固定证明图标，不接受作者指定图标。`example`省略标题时使用本地化的“例子”。标题不建立heading、目录项或知识点槽位。

`disclosure`是通用折叠块，`title`和`icon`均必填。标题支持行内Markdown与公式，正文使用普通块级Markdown。`icon`接受任意Lucide图标的kebab-case名称，构建时解析并内联为静态SVG。它不是证明的别名；需要表达证明语义时必须使用`proof`。

`steps`不接收属性，内部使用一个标准有序列表，列表项可包含段落、公式和嵌套列表。容器嵌套时，外层使用更多冒号；代码围栏与转义中的标记按普通文本保留。

知识点的完整定义、例子和证明板块使用heading与对应`knowledge.*`槽位；`knowledge.proof`由独立heading承担证明语义，正文直接书写。其他板块中的局部证明、例子、通用折叠和步骤使用展示块，并使用局部容器身份。Markdown导出保留例子、证明和通用折叠的标题及正文，步骤保留标准有序列表，折叠状态由网页呈现。证明、通用折叠和参考解答共用原生`details`/`summary`折叠组件：摘要栏包含固定或显式图标、展开状态与方向箭头，正文宽度跟随阅读列；支持键盘操作和CSS高度过渡，减少动态效果偏好下关闭动画。证明标题中的“证明”使用语义化强调元素，而不是仅靠样式加粗。参考解答由答案组件固定标题与图标。步骤保留原生有序列表语义，以轻量编号徽标和连接线表示顺序；装饰编号保持`aria-hidden`，导出使用标准列表序号。小标题可选：第一段用加粗文字作为步骤小标题，后续段落写说明；也可直接写正文，并使用平级语义。编号与首行居中对齐。

## 图片与题注

独立成段的图片使用原生`figure`与`figcaption`，默认继承图片替代文字作为题注。Markdown图片标题可直接定义自定义题注，已有这种写法的题注会保留。

```mdx
![单位圆上的三角函数](https://example.com/unit-circle.webp "单位圆与 $\\sin x$、$\\cos x$")
```

每张图片可独立配置。沿用本站remark-directive标记体系，`::caption`附着于紧邻的、仅含一张图片的段落：

```mdx
![无障碍说明](https://example.com/first.webp)

::caption{mode="none"}

![继承这段替代文字](https://example.com/second.webp "不使用这个标题")

::caption{mode="alt"}

![图片的无障碍说明](https://example.com/third.webp)

::caption[自定义题注，支持 **强调** 和 $x^2$。]
```

优先级为逐图`::caption`、Markdown图片标题、文章默认值。front matter使用`imageCaptions: none`禁用默认题注，或使用默认的`imageCaptions: alt`；逐图声明继续覆盖文章默认值。引入内容遵守来源文章的默认值。标记使用`mode`或题注正文中的一个；多张图片分别成段，保持附着关系明确。

需要复杂结构时也可使用原生`<figure>`、`<img>`与`<figcaption>`。Markdown导出保留图片与可读的自定义题注，网页布局由站点呈现。

## 渲染范围

正文、摘要、标题与索引共用服务端AST→HTML管线及同一套KaTeX配置。正文与摘要支持Markdown、GFM、数学和本站指令；MDX额外支持注册的内容／演示引入和静态原生HTML元素。原生JSX属性使用静态文本；JavaScript表达式、事件处理器和spread由内容语法层拒绝，摘要和more注释除外。标题以单行模式呈现，作者使用行内内容；块结构由渲染器压缩。标题和导航链接只保留链接文字，外层结构与内层链接保持互斥。

摘要中的数学表达式使用`$...$`或反斜杠定界符，并用TeX命令表示上下标、希腊字母和数学运算；普通Unicode字符作为文字使用。预生成的标题和摘要HTML直接供页面及搜索使用。随交互参数变化的演示公式在客户端重新排版。

### 单行模式

`single-line`压缩语义结构，并允许CSS自然换行。作者遵守字段用途；渲染器对误用使用以下映射，保留文字而不直接显示Markdown标记：

| 源结构                 | 单行呈现                         |
| ---------------------- | -------------------------------- |
| heading                | 加粗                             |
| 段落、软换行、硬换行   | 空格                             |
| 行间数学               | 行内数学                         |
| 代码块                 | 行内代码，内部换行转空格         |
| 列表                   | 保留序号或项目提示，项目间用`；` |
| 表格                   | 单元格间用`·`，行间用`；`        |
| 引用、容器、HTML/MDX块 | 递归提取内容                     |
| 图片                   | 替代文字，无替代文字则省略       |

`linkPolicy: "plain"`解包链接，用于标题、导航、目录等可能位于外层链接内的内容；`preserve`保留普通描述和摘要的链接。完整正文和摘要保留块级结构，只有指定单行模式的字段才压缩。

### 演示ICU与Markdown

`IcuMarkdownText`接收模板和参数；演示组件通过`t.markdown(key, values)`取得富文本值。`t(key, values)`用于纯文本属性，`t.raw(key)`取得模板。参数通过ICU formatter注入；支持插值、number、date、time、plural、select和selectordinal，自定义ICU XML标签会报错。

Markdown可以包住参数和选择分支，例如`**{count, plural, one {# item} other {# items}}**`。参数按所在语法层解析，可以包含Markdown、TeX和格式化文本：

- 普通内容位置：参数独立解析为Markdown AST，再嵌入模板；例如`**{label}**`配合`label: "*重点*"`会得到加粗中的斜体。模板与每个参数使用独立的Markdown结构。独立段落参数可以保留块结构，嵌在句子中的块结构按单行规则压缩；最终使用组件的呈现模式。
- 数学节点内：字符串参数按完整TeX片段解析并分组嵌入。例如`$x={value}$`配合`value: "\\alpha+z^2"`显示希腊字母和上标。公式片段独立闭合，外层括号和命令参数保持TeX结构。数字直接参与数学排版；显式ICU number/date/time格式化结果保持格式化文本语义。
- 代码节点内：参数作为代码内容，其中的Markdown保持代码文本。链接目标和图片地址按URL字段插入；图片替代文字和提示文字使用参数的纯文本表示。

可以直接传入`MarkdownValue`保留已生成的富文本；参数中的`{name}`保持字面文本，嵌套消息先调用`t.markdown()`。模板与各参数使用独立的Markdown引用定义。返回的`markdown`从合成后的AST序列化，支持继续嵌套与导出。

数学模板中的TeX命令分组与上下标分组按字面花括号处理，命名参数使用`{value}`；字面分组也可使用标准ICU单引号转义，如`$\\mathrm'{x}'+{value}$`。缺失消息、缺失参数和不完整的TeX参数片段会明确报错。
