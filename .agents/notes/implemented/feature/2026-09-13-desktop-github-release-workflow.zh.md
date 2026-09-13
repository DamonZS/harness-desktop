# Agent Note: 在 GitHub Actions 中构建固定名称的桌面安装包

Status: implemented

[English](2026-09-13-desktop-github-release-workflow.md) | 中文

## 问题

桌面安装包此前只通过本地目标命令构建，Windows builder 只生成 NSIS 安装包。带标签的 GitHub release 需要可重复生成 Windows x64 NSIS/MSI 和 macOS arm64 DMG，并使用稳定的下载名称。

## 决策

桌面发布 workflow 使用原生 Windows 和 macOS arm64 job。Windows electron-builder 的目标为 `nsis` 和 `msi`；workflow 将生成的安装包复制为 `windows-x64-setup.exe` 和 `windows-x64.msi`。macOS job 构建已签名并公证的 arm64 DMG，并复制为 `macos-arm64.dmg`。标签触发的 release job 将这三个文件发布到 GitHub release。

## 取舍

**在一个 Ubuntu runner 上交叉构建所有目标：** 放弃，因为桌面打包脚本要求 `win-x64` 使用原生 Windows 主机，macOS 目标使用 macOS 主机。

**全局修改带版本号的 electron-builder 产物名：** 放弃，因为更新元数据和 COS 上传校验依赖带版本号的名称；稳定的 GitHub 下载名称只应用于 release 副本。

## 影响

匹配 `V*` 或 `v*` 的标签会生成包含三个固定名称安装包的 GitHub release。macOS 发布需要仓库 Secret 提供签名证书、证书密码、签名身份、Team ID 和 App Store Connect API key 凭据。Windows 产物当前未签名，可能显示 Windows 安全警告。
