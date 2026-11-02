# AGENTS.md

## 仓库边界

- 公开仓只保存公开源码、公开内容及其当前契约。私有仓可作为整体参与本地构建和受控部署；私有正文、标题、描述、路径、任务ID、生成结果、凭据和运行状态留在私有范围内。
- 在系统临时目录保存临时探针、调查脚本、抓取结果和临时验证夹具，并在任务结束前清理。临时路径、设备与主机信息、日志和本地验证结果留在工作环境中。
- 使用仓库内显式定义、自包含的入口。构建时隔离公开与私有输入、缓存和产物；通过远端引用核对已发布的提交。
- 保留工具的正常功能、缓存和目录配置；遇到权限问题时定位拒绝来源并按权限流程处理。
- 重构完成后收敛到单一内部入口和实现路径。兼容路径仅用于公开契约明确要求兼容的场景，交付时完整满足当前契约。
- 仓库描述当前部署契约。Cloudflare Access、DNS、Custom Domain、生产凭据、远端分支状态和一次性控制台操作在各自环境中管理。
- 禁止创建本地覆盖文件或依赖仓库外状态的隐式入口。
- 禁止把临时探针、绝对路径、设备与主机信息、命令输出、日志片段或本地验证结果写入源码、文档、测试或注释。
- 禁止通过删除或关闭缓存、迁移缓存目录或破坏正常目录结构规避权限、性能或验证问题。
- 禁止在内部重构完成后保留旧入口、双读路径、兼容别名或过渡层。公开契约明确要求的兼容路径按该契约维护。
- 禁止把已知降级、临时兼容路径或待收窄的实现作为完整交付。
- 禁止混用公开与私有构建、缓存或产物，或假定本地未提交改动已经进入远端分支。
- 禁止在仓库中记录外部部署的临时调整、远端分支状态或一次性控制台操作。

## 文档与注释

- 文档使用中文。代码标识符、命令、协议名和标准格式可以保留英文。
- 代码注释使用英文。文档和注释以内仓规格及当前实现为事实源，解释当前行为及其原因。外部资料仅用于调查和验证。
- 禁止在文档或注释中记录变更过程、旧实现、迁移叙事或与当前契约无关的负面口径。
- 禁止将外部文档、二进制资料或私有内容复制进公开仓。
- 每个契约保留一个事实源。README提供入口，详细规则写入对应文档，技能通过链接引用。
- 禁止在README、技能和指南中重复维护同一契约。
- 可见文本的中西文与数字间距规则以[Markdown与MDX写法](docs/writing/syntax.md#中西文间距)为准，命令见[开发、索引与部署](docs/operations.md#开发)。间距检查、写入和候选警告纳入`format`与`format:check`。
- 文档示例使用`example-*`、通用标题和正文展示结构。完整规则见[文档示例](docs/writing/syntax.md#文档示例)。

## 测试数据与断言

- 单元测试、浏览器测试和开发服务器测试使用自包含的合成数据。夹具文档使用独立的`fixture-*`身份；标题、正文、路由、任务ID和资源均为测试构造。使用本地夹具模拟外部请求和公开、私有分区。
- 禁止将真实公开或私有内容、真实页面路径、外部服务或生产状态作为上述测试的输入、固定用例或通过条件。
- 部署smoke从当前`dist`动态发现路由和资源，只断言产物契约，例如状态、资源结构和响应头。稳定的产物契约路径可以固定。
- 禁止在部署smoke中硬编码真实页面路径、正文、条目数量或具体内容资源名称。
- 用合成夹具覆盖固定行为和语义。UI几何和时序断言为可解释的平台渲染差异预留边界；请求断言等待对应请求或响应。
- 禁止通过削弱语义断言或用固定轮询掩盖问题来修复失败。
- 禁止原样保留重复失败的时序断言。追查差异并选用可观测的稳定条件。

## 结构化内容

- 派生内容沿用已有AST或结构化结果。为独立作者输入建立AST，供页面、摘要、索引和导出共用。
- 禁止把已有AST或结构化结果序列化成Markdown、纯文本或HTML后再解析，以获取原本已持有的结构。

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
