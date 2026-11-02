# 开发、索引与部署

## 开发

使用Node.js 24和pnpm（见package.json）。

```sh
pnpm install
pnpm dev
pnpm clean
pnpm clean:dev
pnpm check
pnpm content:spacing:check
pnpm content:spacing:write
pnpm build
pnpm preview
pnpm verify:artifacts
pnpm test:deployment
pnpm test:browser
pnpm deploy
```

`pnpm dev`同时启动公开和私有开发分区：公开页面在根路径，私有页面在同一地址的`/private/`，私有Next进程使用自动分配的本地端口。若只需单独开发私有站，可运行`CONTENT_MODE=private pnpm dev --port 3001`。开发模式不提供Access验证。本机网卡地址与主机名自动加入Next.js开发来源白名单；自定义主机名可通过`DEV_ALLOWED_ORIGINS`逗号分隔配置。

`content:spacing:check`只读检查仓库Markdown文档、公开与私有可见内容，可通过位置参数指定文件或目录；`content:spacing:write`使用同一AST结果写入。该脚本独立于`format`，并由`pnpm check`执行只读校验。

开发缓存按公开端口保存在`.dev/instances/<port>/{public,private,generated}`。同一端口重启会复用编译缓存；不同端口仍可并行开发。生产构建将公开与私有Next缓存分别保存在`.dev/next/{public,private}/cache`，构建时切换到Next默认的`.next/cache`，静态导出写入`out/`后进入独立事务目录；CI恢复并保存`.dev/next`。`pnpm clean:dev`删除实例缓存、Next编译缓存和测试输出，但保留已生成的`dist`；`pnpm clean`删除全部生成产物。`pnpm dev`和`pnpm build`不会在每次运行时删除可复用缓存。

`PRIVATE_CONTENT_DIR`可指定私有仓路径；未发现私有仓时构建公开站。权限拒绝和内容契约错误会使准备失败。开发服务器监听公开及私有正文、公开分类入口、演示元数据与内容生成器。修改后会合并连续保存事件，串行重新生成目录、搜索、Markdown和演示数据，再同步两区资源，通过Next.js热更新刷新页面。组件代码由Next.js Fast Refresh处理。终端输出生成开始、完成或错误；生成失败时保留上次成功的产物，修正源文件后自动重试。生产构建一次性生成静态产物。

共享控件位于`src/components/ui`：本地shadcn风格源码统一外观和项目入口，Radix Primitives承担弹层、焦点约束、键盘操作、选择与折叠交互。题目组件保留答案、判分和草稿逻辑，通过本地Checkbox、RadioGroup、Textarea复用基础控件。`overlay-focus`只补充本站需要的打开来源焦点恢复、滚动稳定和导航后的焦点处理；Escape、焦点约束和菜单导航仍交给Radix。

CSS/Tailwind负责简单状态和主题样式；Motion用于状态驱动、连续数值和动态内容高度动画，并遵守减少动态效果偏好。语义内容继续使用原生HTML/SVG。Sonner负责通知，next-themes负责主题，next-intl负责界面文案与格式化，Lucide统一提供图标。

富搜索由Radix Dialog、本地Input、FlexSearch和结果卡片组合。结果包含摘要展开、图片和多个独立链接。普通图片和裁剪图片共用`react-medium-image-zoom`；裁剪以引用原图的内联SVG viewBox表示，查看器负责动画和滚动手势关闭，项目包装层负责关闭完成后的焦点返回。

## 索引与Markdown

`/llms.txt` → `/index.json` → 分块目录索引 → 完整entry资源 → 页面/section Markdown。目录索引entry携带`key`、标题、页面/Markdown地址和稳定entry地址；完整标题、题集与section数据位于`/index/<目录>/entries/<文档key的SHA-256前缀>.json`，调用方可按需请求并合并。分类入口的元数据发现地址为`/taxonomy.json`，具体维护方式见 [学科与课程](writing/taxonomy.md)。页面head提供`rel=alternate`和`rel=describedby`。Markdown导出直接使用源AST和展开引用，保留GFM与数学扩展。

包含显式题集或题集外交互题目的页面提供`<页面路径>questions.json`；每个显式题集另提供`<页面路径>questions/sets/<题集ID>.md`。资源保存题集结构、题目与答案Markdown、讨论源文本和渲染HTML；题集外题目保存在隐藏的`default`集合中，并按题目提供Markdown。浏览器的复制、下载与讨论操作按需读取资源并选择对应题集或题目；题目Markdown位于各自的`.md`地址。

```sh
pnpm content:query "<查询词>"
pnpm content:query "$PRIVATE_TASK_ID" --private
pnpm content:query "<查询词>" --online
pnpm content:query "$PRIVATE_TASK_ID" --online --private
```

私有查询通过`PRIVATE_TASK_ID`环境变量传入任务ID。在线查询使用`cloudflared access curl`完成浏览器登录；token保留在认证工具中，cloudflared由用户按需准备。

## 部署

`pnpm build`先在一次事务目录中生成完全隔离的`dist/public`与`dist/private`，两侧都成功后整体替换`dist`，失败时保留上一次成功产物。公开与私有产物分别部署。`pnpm verify:artifacts`检查公开catalog的文档与私有路由隔离。`pnpm test:deployment`从当前`dist`动态发现页面与资源，并通过本地静态预览验证状态、结构和响应头；固定正文和固定路由由fixture浏览器测试覆盖。

`wrangler.public.jsonc`部署`dist/public`；`wrangler.private.jsonc`将`dist/private`挂载到`/private`并部署为独立Worker。运行`pnpm deploy`会在成功构建后先发布私有侧，再发布公开侧。Cloudflare Access规则必须覆盖`/private`、`/private/*`和私有Worker的全部静态资源入口，不保留绕过规则的公开入口。现有R2外链附件仍受它自身的访问配置控制，不会因MDX位于私有仓而自动变成私有。本地`pnpm preview`在一个端口模拟两站路由，但不提供Access身份认证，不可作为生产源站。

CI使用GitHub App的短期token只读checkout私有仓；需要`CONTENT_APP_CLIENT_ID`、`CONTENT_APP_PRIVATE_KEY`和`CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID`。App未配置、私有checkout获取失败或私有内容目录没有MDX时，CI只部署公开Worker，不发布空的私有站。生产部署还要求repository variable `ACCESS_CONFIGURED=true`，该变量只在真实未登录访问验证通过后设置。

外部PR使用公开仓的只读权限。工作流分别构建和部署公开、私有产物，私有构建产物与生产凭据保留在生产任务中。提交与推送由仓库维护者决定。

## 站点功能与本地化

讨论菜单提供ChatGPT、Claude、Grok的提示词链接，以及Codex、Claude Code、Cursor本地讨论入口。公共内容默认附链接，私有内容默认附原文，均可切换为两者；过长内容回退到复制提示词。

工具链保持兼容范围内的最新版本。

界面本地化使用next-intl：通用界面当前只提供`messages/zh-CN.json`；演示文案位于各自元数据文件并按需载入，默认中文，组件通过消息键读取文案；整句插值和数量使用ICU，日期、数字通过locale formatter格式化。文章语言与界面语言独立，正文、标题、摘要和引入块保留各自的`lang`。新增界面语言时同步扩展`src/i18n/config.ts`与消息注册，组件通过消息键和本地化配置选择文案。

## 首页与演示

私有首页的推荐文章和交互探索合并公开与私有内容，身份相同时私有版本优先。分类与学科浏览入口使用当前站点的内容数量和路径，不因内容为空而隐式切站；空列表提供对应公开页面的尝试入口。合并推荐中的公开内容保留公开链接并标注来源，跨站使用完整文档导航。

列表卡片以标题链接提供整卡点击区域，保留统一的右上箭头。摘要展开、图片放大和次级链接保持独立操作；每张卡片只保留一个导航链接，并由该链接覆盖卡片点击区域。首页、目录、文章列表和搜索结果共用这一规则。

演示的实现、元数据与挂载契约见 [制作交互组件](writing/interactive-demos.md)。站点通过Next.js dynamic按需加载组件；文章只携带实际使用演示的数据。

构建生成`/demos/index.json`，私有版本位于`/private/demos/index.json`并合并两侧引用。每项演示使用元数据文件对应的全站唯一语义ID，例如`bayes`；组件复用或引用页面移动不改变该ID。首页内联数量与按语言组织的指纹地址：轻量ID列表供随机选择，完整目录供`/demos/`分页浏览。完整目录包含已经选定译文并渲染的标题、说明、学科ID、本地化`subjectTitle`、标签和详情URL；进入交互演示目录后才请求它，切换演示时再按需请求详情并加载组件。目录按当前界面语言的标题自然顺序预先排序，标题相同时使用稳定ID兜底；显示序号不是身份，深链始终使用`?demo=<id>`。

详情记录使用独立`source`表示拥有该实现的知识点页面，`references`保存课程笔记、文章或其他引入位置。同一演示有且只有一个知识点来源，并在该页面内出现一次；生成器在重复挂载或多个知识点来源时直接失败。详情路径为`/demos/<id>/<该项内容指纹>.json`，ID列表和完整目录也各有指纹；修改一项只更新该项详情与相关目录，其他详情地址及组件缓存保持有效。公开目录和详情正常缓存；私有请求使用no-store。

`/demos/`使用列表-详情结构：搜索、学科筛选、关联页面和预览都在客户端处理，列表按批追加并支持`?demo=<id>`深链。原始出处排在关联页面的第一项，并使用独立语义。

首页入口锚定完整展示区，包含标题、说明和切换演示按钮；占位与实际演示按内容测量高度，通过Motion平滑过渡。首页靠近视口时载入演示，支持换一个、单演示重新开始、加载失败重试，并尊重减少动态效果设置。此处刷新只更换本页演示，页面与服务端运行时保持不变。

跨站阅读入口通过对应页面的HEAD响应确认可访问性，集合页由该响应决定。初始、未知或检测失败状态都保留对应路径；受Access限制时显示尝试入口。空的内容根目录保留空列表页面。

KaTeX的版本定义位于pnpm catalog，项目直接依赖与数学解析、渲染插件的传递依赖覆盖同时引用它。HTML生成、CSS、字体和`katex/contrib/copy-tex`均使用该包版本；copy-tex是官方包内扩展，不是独立依赖。

快捷键定义位于`src/lib/keyboard.ts`，使用语义ID引用。浏览器统一按UA Client Hints的平台信息或UA字符串识别Apple平台；搜索在Apple平台使用Command+K，其他平台使用Ctrl+K。`KeyboardShortcut`同时负责按键标记和本地化无障碍说明，实际注册从同一份定义生成并交给tinykeys匹配。静态HTML使用平台中性提示，hydration后显示平台相关按键。Escape关闭由Radix弹窗统一处理。Sonner通知的聚焦快捷键也从共享定义传入，Apple平台显示Option+T，其他平台显示Alt+T。

## 富文本产物契约

`content:prepare`预生成静态Markdown字段，页面和搜索客户端只消费准备好的HTML与纯文本。每个独立作者Markdown输入建立一次AST；完整正文、标题、摘要、section、题集和导出在内部沿用对应AST或子树，派生Markdown、纯文本与HTML从同一结构生成。完整正文使用服务端Expressive Code、KaTeX与内容指令管线；运行时演示使用独立的轻量Markdown/ICU AST模块，并保持客户端包边界。参数在Markdown、TeX、代码和URL各层独立解析并嵌入，普通参数支持富文本与公式；合成后的AST同时生成显示内容、纯文本与可再次嵌套的Markdown。

catalog、taxonomy、题集资源版本为2，目录索引和entry资源版本为3；演示详情和ID列表为3、演示目录为4、manifest为5。搜索记录的标题、描述与分类名称直接保存三字段对象。一次部署使用同一版本生成的全部JSON；内容生成时验证全部演示翻译的ICU结构，运行时检查所选分支的实际参数。

## 构建期与运行时的语言契约

内容统一使用规范化的BCP 47语言键，选择顺序为精确语言、基础语言、`defaultContentLocale`。默认语言定义必填，译文按这条回退链选择。文章、分类、演示译文与运行时清单地址共用`src/i18n/content.ts`的规则；UI是否支持某语言由`resolveUiLocale`和界面消息注册决定，内容译文及Intl格式化由内容语言链决定。

演示构建为每个已注册UI语言及已定义内容语言生成独立清单，按该语言的标题排序，并在生成期完成学科名称与标签的选择。`demo-manifest.json`的`locales.<语言>`直接给出该语言的`index`、`catalog`指纹URL；`/demos/<语言>/index.json`提供同一份本地化目录，`/demos/index.json`是默认语言目录。默认译文缺失、消息键或ICU参数名不一致都会使准备失败。

运行时根据当前UI语言及回退规则选择一次资源地址。清单中的`subjectTitle`、`title`、`description`、`tags`是可直接显示的MarkdownValue；运行时读取这些已选定的本地化字段。详情URL指向对应译文的消息、标题与标签，`locale`表示最终选中的消息语言；缺翻译的演示整体回退到默认译文，消息语言保持一致。运行时ICU与formatter使用该语言及站点`timeZone`，日期按站点时区格式化。标签用于显示和搜索，页面和路由由内容路径生成。演示列表和详情共用`DemoMetadata`，使用同一份已本地化字段、Markdown渲染和分隔符；仅展示数量与布局可以不同。
