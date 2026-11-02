---
name: query-learning-index
description: 在Learning Notes的本地或线上索引中查找知识点、课程、任务和section；不用于修改内容。
---

# 查询学习索引

先判断用户需要公开还是私有内容、本地还是线上数据。查询命令及索引入口见[运维文档](../../../docs/operations.md)。本地查询依赖已生成的索引；索引缺失或过时时，先确认内容来源并重新运行`pnpm content:prepare`。私有线上查询需要cloudflared和用户完成Access登录；缺少工具时说明，不擅自全局安装，也不把Cookie或token放进链接或仓库。

任务ID需要连同学科、课程和类型解释，不假设全站唯一。从根索引沿children逐层定位，优先读取匹配页面或section的Markdown，避免下载全站正文。结果要注明来源及公开或私有范围；不要把私有正文带入公开产物。
