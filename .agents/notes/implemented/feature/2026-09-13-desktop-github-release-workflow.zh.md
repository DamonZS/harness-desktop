# Agent Note: 在 GitHub Actions 中构建固定名称的桌面安装包

Status: implemented

[English](2026-09-13-desktop-github-release-workflow.md) | 中文

## 问题

桌面安装包此前只通过本地目标命令构建，Windows builder 只生成 NSIS 安装包。带标签的 GitHub release 需要可重复生成 Windows x64 NSIS/MSI 和 macOS arm64 DMG，并使用稳定的下载名称。

## 决策

桌面发布 workflow 使用原生 Windows 和 macOS arm64 job，构建触发工作流的提交。Windows electron-builder 的目标为 `nsis` 和 `msi`；workflow 将安装包复制为 `windows-x64-setup.exe` 和 `windows-x64.msi`。WiX 使用较短输出目录以避开路径长度限制。macOS job 构建临时签名、未经公证的 DMG，命名为 `macos-arm64.dmg`，并保留独立的凭据签名打包命令。两个平台均成功后，恰好包含三个文件的草稿才公开发布。

Main 推送和手动操作从已发布 Release 选择下一个版本，不使用孤立标签计算。手动版本输入支持重试尚未发布的版本。标签在产物齐全后写入；失败构建遗留的未发布标签可通过精确租约保护移动。已发布 Release 始终保留，不被替换。

构建作业将宿主 Node.js 固定为 22.23.2，与应用内置运行时独立。Node.js 24.17.0 在 `extract-zip` 处理已校验的 Windows 运行时压缩包时因顶层 await 未完成而退出；Node.js 22 构建宿主可以完成该解压过程。应用保留上游的 ASAR 布局，原生文件单独解包。

## 取舍

**在一个 Ubuntu runner 上交叉构建所有目标：** 放弃，因为桌面打包脚本要求 `win-x64` 使用原生 Windows 主机，macOS 目标使用 macOS 主机。

**全局修改带版本号的 electron-builder 产物名：** 放弃，因为更新元数据和 COS 上传校验依赖带版本号的名称；稳定的 GitHub 下载名称只应用于 release 副本。

## 影响

GitHub 产物不要求签名 Secret。Windows 安全警告和 macOS Gatekeeper 限制仍然存在；发布说明注明 Windows 未签名、macOS 未公证。打包测试覆盖无凭据配置与工作流命令解析；Shell 测试验证版本递增、无效输入和已发布版本拦截。原生 Actions 构建在公开发布前验证 MSI 与 DMG 产物。
