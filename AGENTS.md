# AGENTS.md

## 仓库边界

- 仓库只保存公开源码、公开内容及其当前契约。私有仓可以作为整体参与本地构建和受控部署，但不得把私有正文、标题、描述、路径、任务ID、生成结果、凭据或运行状态带入公开仓。
- 临时探针、调查脚本、抓取结果和验证夹具必须位于系统临时目录，并在任务结束前清理；不得把临时路径、主机信息、命令输出或本地环境写入仓库。
- 仓库内不创建本地覆盖文件或其他依赖仓库外状态的隐式入口。测试和fixture必须自包含，外部服务、私有仓和真实生产状态不能成为通过条件。
- 内部实现重构完成后不得保留旧入口、双读路径、兼容别名或过渡层。只有对外公开契约明确要求兼容时才保留兼容路径。
- Cloudflare Access、DNS、Custom Domain和生产凭据属于外部部署状态。仓库只描述当前部署契约，不记录临时调整、远端分支状态或一次性控制台操作。

## 文档与注释

- 文档使用中文。代码标识符、命令、协议名和标准格式可以保留英文。
- 代码注释使用英文，解释当前行为及原因。文档和注释都不记录变更过程、旧实现、迁移叙事或非必要的负面口径。
- 文档和注释以内仓规格及当前实现为事实源。外部资料只用于调查和验证，不得把外部文档、二进制资料或私有内容复制进仓库。
- 每个契约保留一个事实源。README只做入口，具体规则写入对应文档，技能引用文档而不复制同一契约。
- 可见文本的中西文与数字间距规则以[Markdown与MDX写法](docs/writing/syntax.md#中西文间距) 为准，检查与写入命令见 [开发、索引与部署](docs/operations.md#开发)。该脚本独立于`format`，不得挂到格式化流程。

## 常见误区

- 为了构造测试，把真实私有仓的任务ID、路径或标题复制到公开fixture。fixture使用独立的合成身份，例如`fixture-*`，正文也必须是合成的。
- 把临时探针、绝对路径、设备信息、日志片段或本地验证结果写进源码、文档、测试或注释。
- 通过删除缓存、关闭缓存、改变缓存目录或破坏正常目录结构来规避权限、性能或验证问题。
- 把“第一版粗粒度实现”“暂时保留的兼容路径”或“后续再收窄”作为交付方案。实现应在完成时满足完整契约，不以已知降级作为中间结果。
- 内部已经持有AST或结构化结果时，再序列化为Markdown、纯文本或HTML后重新解析。派生内容应沿用现有结构，只为独立作者输入建立AST。
- 为修复一个用例而削弱语义断言，或保留反复失败的时序断言。UI几何与时序断言应允许平台渲染产生的稳定噪声边界；请求验证应等待实际请求/响应，不使用固定轮询掩盖行为。
- 让部署产物测试依赖固定正文或fixture内容。部署smoke从当前`dist`动态发现路由和资源，固定行为由合成fixture覆盖。
- 在文档中描述“之前怎样”“已经改成什么”“旧实现为什么不好”，或加入与当前契约无关的负面口径。
- 用中文编写代码注释，或把英文说明文档写入仓库。
- 在README、技能和指南中重复维护同一规则，导致实现变更后多个事实源不一致。
- 把公开仓和私有仓的构建、缓存或产物混合，或假定工作区中的未提交更改已经进入远端分支。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
