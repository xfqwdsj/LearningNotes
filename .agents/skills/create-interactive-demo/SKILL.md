---
name: create-interactive-demo
description: 在Learning Notes中创建或修改知识点里的MDX交互演示组件，包括元数据、注册、挂载、本地化、SVG和可访问性；不用于普通文章写作或内容解析器改造。
---

# 制作交互组件

入口为 [制作交互组件](../../../docs/writing/interactive-demos.md)。先读完整指南，再改实现。可见文本的中西文间距遵循 [语法文档](../../../docs/writing/syntax.md#中西文间距)。普通文章或知识点写作使用`author-learning-content`；修改解析器、内容契约或部署配置使用`maintain-content-contract`。

## 关键约束

- 交互探索按MDX客户端组件编写，并挂载在知识点正文中。稳定ID、元数据、注册、知识点唯一来源与MDX挂载必须同时落地。
- 先查已有知识点和演示；同一问题已有实现时优先维护来源，不为课程页面复制另一份组件。
- 组件只回答一个具体问题，不重复外层“交互探索”标题。文案从演示元数据读取，日期和数字使用locale formatter，公式与富文本使用站点Markdown/ICU组件。
- 控件在hydration前不可操作，支持键盘和指针操作，并尊重减少动态效果。初始语言或传播属性失败时提供可理解反馈，不让异常扩大为整页错误。
- 画布固定`viewBox`，交互不得改变页面布局。计算得到的SVG数值必须经`roundSvgNumber`输出边界舍入；它降低跨引擎末位差异触发hydration mismatch的概率，但不是逐位一致性的硬保证。
- 图表文字、ARIA、纯文本和公式使用各自契约；不要把SVG坐标舍入用于语义数值。

## 验证

检查服务端初始HTML、hydration后交互、控制台无hydration mismatch、键盘操作、窄屏布局、公式、Markdown降级、来源链接和减少动态效果。按改动运行相关单元测试、开发态浏览器检查、`pnpm check`与构建。
