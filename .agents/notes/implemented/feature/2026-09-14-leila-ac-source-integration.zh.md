# Agent Note: Mount Leila AC resources as a source-level skill provider

Status: implemented

[English](2026-09-14-leila-ac-source-integration.md) | 中文

## Problem

Leila-Codex Offline 资源集位于仓库外部，因此本仓库的 profile 无法提供 AC 路由、Leila 身份 skill 或共享的直接执行指令。

## Decision

`@deepseek-ai/dsh-skill-leila-ac` 将资源集放在 `packages/skill/skill-leila-ac/assets/` 中。其 Cordis 插件向 `ctx.skills` 注册 `leila-ac` 提供方，提供 `ac` 和 `leila-identity` 两个条目，并把 `gpt5.5-unrestricted.md` 作为位于 `HARNESS_IDENTITY` 之后的 `ctx.systemPrompt` 区段加入。`dsh-base` bundle 默认启用该插件，使 web、headless、SDK、ACP 和 desktop 组合获得相同的源代码级资源。skill 正文作为不可变的包资产按需加载；会话状态和路由执行仍由现有 skill registry 与 agent loop 负责。

## Alternatives considered

**将文件复制到每个 profile 或用户 skill 目录。** 不采用：重复资产会在不同 profile 之间产生漂移，也不会进入发布包的依赖闭包。

**把路由行为加入 `agent-loop`。** 不采用：该资源集属于提示词和 skill 内容，而 loop 生命周期与 session 日志已有明确归属；修改 loop 会扩大既有契约，却没有增加运行时语义。

**运行时读取外部安装目录。** 不采用：部署环境和打包后的 desktop 不能依赖机器特有的 `F:` 路径；由包持有资产可以保持源代码平面和构建产物平面的可复现性。

## Consequences

`dsh-base` 的依赖闭包增加一个包及其不可变 Markdown 资产。更新资源集需要修改包资产并重新构建受影响的运行时。针对性测试覆盖提供方注册、正文加载、释放和系统提示组装；常规包构建与 Host 构建门禁仍是发布检查。
