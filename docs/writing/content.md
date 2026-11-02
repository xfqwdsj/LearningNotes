# 内容组织与元数据

## 路径与身份

公开内容位于本仓库`content/`；私有内容位于同级`LearningNotes-Private/content/`，也可通过`PRIVATE_CONTENT_DIR`指定私有仓路径。

- `content/knowledge/<学科>/<分类…>/<名称>.mdx`：独立知识点，URL按原始路径生成并保留学科与子目录；名称只需在同一目录内唯一。
- `content/courses/<学科>/<课程>/<章节>.mdx`：课程笔记。
- `content/tasks/<学科>/<课程>/<exercise|exam|quiz|assignment>/<ID>.mdx`：任务。ID是字符串，命名空间固定在学科、课程和类型层；类型表示任务性质，不表示完成状态。
- `content/articles/<文章slug>.mdx`：自由文章。

每层内容目录都用`_index.mdx`表示目录入口。生成的站点路由仍对应目录路径，机器索引仍使用`index`路径。普通目录提供`title`与`description`；学科与课程的镜像目录继承专属入口元数据，字段规则见[维护学科与课程](taxonomy.md#集合目录如何复用)。分类可选`order`；课程和文档先按目录order、文档order排序，未指定文档order时按当前显示语言的默认自然顺序排列标题，标题相同时按内容路径稳定排序。

## 写作指南

- [维护学科与课程](taxonomy.md)：集中维护分类身份、名称、图标和阅读入口。
- [编写知识点](knowledge.md)：确定概念边界、组织独立正文和交互探索、提供可复用的板块。
- [编写课程笔记](notes.md)：组织课程阅读入口、引入知识点并整理课程约定与复习要点。
- [制作交互组件](interactive-demos.md)：实现、注册和挂载MDX交互演示。

本文维护位置、身份、元数据与语言契约；[Markdown与MDX写法](syntax.md)维护标记、槽位与呈现规则。指南提供编写方法，通过链接引用这些契约，不另行定义。

## Front matter

文章的`title`必填；`description`、`order`、`tags`、`summaries`、`showDates`可选。路径决定kind、subject、course、taskType、id、slug，这些字段只出现在生成结果中。创建和更新日期从Git完整历史推导；文章默认展示日期，其他类型默认隐藏。未提交文件和浅克隆缺少日期。

## 翻译

默认内容为中文。所有类型的译文放在`content/<BCP 47语言标记>/`下，保持相同分类路径、文件名和目录描述，例如`content/<language>/courses/<subject>/<course>/<chapter>.mdx`。知识点译文保持相同的学科、子目录与文件名，section标记跨语言保持稳定。

版本按身份关联，路由增加语言前缀，只为真实译文生成语言链接与hreflang；未翻译内容回退到已有版本并标明语言。文章语言与界面语言独立。

## 任务内容

任务按需使用`task.problems`（题目）、`task.constraints`（条件）、`task.work`（个人作答）、`task.reference`（参考解答）、`task.feedback`（反馈）、`task.correction`（个人订正）、`task.errata`（试题勘误）和`task.attachments`（附件）槽位，均可省略。个人作答中的电子档案保留个人作答语义，不自动归类为附件。专属呈现由来源类型与显式槽位共同决定，不猜测中文标题。

任务中的题集、题目、作答关联和电子档案写法见[题集、题目与小题](syntax.md#题集题目与小题)。

正文资源使用标准Markdown完整URL，更换资源域名时批量替换正文。

## 内容文字字段

内容性字段统一保存为`MarkdownValue`：`{ markdown, text, html }`。源文件写Markdown字符串，生成器负责派生纯文本和HTML；作者只编辑源字符串。页面metadata、搜索、排序、图片alt和ARIA使用`text`。内容标签`tags`同样使用单行模式的三字段对象；ID、路径、URL、日期、题号和技术键名保持字符串。

字段呈现模式固定：标题、目录和分类名称、板块标题、选项标签、题注、引用标题使用`single-line`；描述和摘要使用`summary`；正文、作答与讨论源使用`block`。文档、section、题面和作答本身携带`markdown`、`text`、`html`三个字段；标题、摘要、选项标签和讨论源以独立的三字段对象保存。客户端题目视图只投影交互所需数据，完整源文本保存在按需读取的题集资源中。

演示标题与描述同样在构建期生成。演示`messages`保留ICU+Markdown模板字符串，参数依赖交互状态，在运行时生成临时`MarkdownValue`。普通界面消息保持纯文本。

文章的标签属于文章自身语言的内容；演示标签放在各自`locales.<语言>.tags`，由构建期按语言生成清单。标签用于显示和检索，页面与路由由内容路径生成。数学符号在标签和标题中使用行内公式，例如`$x$函数`、`$y$变量`，普通字母和Unicode字符保持原始文本语义。
