# Agent Note: settings 写入后立即显示模型提供方

Status: implemented

[English](2026-09-13-model-provider-write-mirror.md) | 中文

## Problem

模型设置页成功写入新提供方后，共享 settings 镜像仍保存写入前的 namespace 视图。页面在失效事件到达前复用了 ready 快照，将提供方判定为未配置，因此没有把它渲染到已配置列表。

## Decision

Models operations 绑定从插件 apply 函数接收共享 settings describe face。每次 `settings.mutate` 成功后，先通过 `acceptView` 将返回的 namespace 视图折回镜像，再把写入结果返回卡片。直接调用 operations 的现有测试和非页面调用方可以省略该 face；生产 wiring 始终传入它。

## Alternatives considered

**等待 `settings/document-updated`。** 事件异步到达，页面可能先渲染 ready 快照，提供方会一直缺失到下一次刷新。

**每次写入后强制完整 `settings.describe`。** 这会增加一次网络往返，并重复读取写入操作已经返回的 namespace 视图。

**让列表 store 在本地推断新提供方。** store 不拥有完整 settings 文档或写入语义，本地推断可能与 Host 应答分歧。

## Consequences

成功的创建、编辑和删除操作会立即更新共享镜像的所有消费者，同时保留现有失效路径处理外部变更。可选的 operations 参数保持独立组件测试和非页面调用方的源代码兼容性；页面 apply wiring 仍是共享 face 的所有者。

## Testing

Models apply 测试验证成功的 settings 写入返回已写入视图，并在 operation 流程中调用共享镜像的 `acceptView`。
