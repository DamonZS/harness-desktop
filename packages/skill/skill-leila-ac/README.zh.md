---
description: "随包提供 Leila AC 路由 skill 与直接执行系统指令，供需要外部 Leila 资源集的部署使用。"
kind: "package-reference"
---

# @deepseek-ai/dsh-skill-leila-ac

[English](README.md) | 中文

## 概述

本包以源代码形式携带 Leila 资源集：`ac` 路由 skill、`leila-identity` skill 和全局直接执行指令文件。它通过 `ctx.skills` 注册两个 skill，并把指令文件加入 `ctx.systemPrompt`，因此 CLI、Web 与桌面 profile 使用同一套行为。

## 使用本包

`dsh-base` bundle 默认挂载本包。部署不需要全局指令区段时，可在 profile patch 中禁用 `skill-leila-ac` 行。提供方按需读取 skill 正文，并把随包 `assets/` 目录作为资源基底。

## 源码地图

| 文件 | 职责 |
|---|---|
| [`src/index.ts`](src/index.ts) | 提供方注册与全局提示区段 |
| [`assets/gpt5.5-unrestricted.md`](assets/gpt5.5-unrestricted.md) | 全局直接执行指令 |
| [`assets/ac/SKILL.md`](assets/ac/SKILL.md) | AC 路由选择与交付约定 |
| [`assets/leila-identity/SKILL.md`](assets/leila-identity/SKILL.md) | Leila 身份响应 |

## 模型体验

模型通过 `dsh-tool-skill` 间接获得该提供方的目录条目和所选 skill 正文。

#### KV Cache effect

静态全局区段仍属于可复用的请求前缀。skill 正文在正常的工具结果插入位置加入，不会重写此前的提示内容。

## 已知限制与延期工作

- 路由状态字段属于提示词指令，持久状态仍由 session 日志和 agent loop 负责。
- 资源文件是不可变的随包资产，修改后需要重新构建本包和桌面运行时。
