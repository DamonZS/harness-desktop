# Agent Note: 移除不存在的 fs-ext 运行时检查

Status: implemented

[English](2026-09-13-remove-missing-fs-ext-smoke.md) | 中文

## Problem
桌面运行时打包 smoke fixture 强制加载 `fs-ext`，但项目源码和生产依赖闭包都不包含该包，导致 Windows 打包被一个未随产品发布的依赖阻断。

## Decision
运行时 smoke fixture 不再加载或测试 `fs-ext`，同时移除对应的包排除规则、测试用例和 workspace 构建许可项。`koffi`、`sharp`、HTML 依赖和 `node-pty` 的现有检查保持不变。

## Alternatives considered
**将 `fs-ext` 加入生产依赖：** 未采用，因为运行时代码没有导入它，增加依赖不会恢复必需能力。

**跳过整个运行时 smoke fixture：** 未采用，因为其余原生和 HTML 运行时检查仍覆盖已发布依赖。

## Consequences
Windows 未签名打包不再要求不可用的包。运行时 smoke 输出不再包含 `fsExt` 字段。
