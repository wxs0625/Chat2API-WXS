# 修改日志 (Changelog)

本项目的所有重要变更都会记录在此文件中。

## [1.5.3] - 2026-08-29

### 🐛 修复 (Bug Fixes)

- 重构发布工作流，先创建唯一 Release 再并行构建，修复重复 Release 导致资产 404 (`7ecfb3f`)

## [1.5.2] - 2026-08-29

### 🐛 修复 (Bug Fixes)

- 设置 releaseType 为 release，使 CI 发布正式 Release 而非 draft (`ca00811`)

## [1.5.1] - 2026-08-29

### 🐛 修复 (Bug Fixes)

- 修正 linux.desktop 配置为 electron-builder 26.x 的 entry 格式，修复 CI 全平台构建失败 (`ea03168`)

## [1.5.0] - 2026-08-29

### ✨ 新功能 (Features)

- 新增自动版本发布脚本，支持按 Conventional Commits 自动生成版本号和修改日志 (`
fc5823`)

### 🐛 修复 (Bug Fixes)

- 修复发布失败——同步 package-lock.json 版本号并修正 vite 依赖版本 (`7e53264`)
- 修复首次无 tag 发布时只统计根提交导致漏记后续提交的问题 (`
08fe4c`)
- 修复 auto-release 脚本 git log 分隔符在 execSync 中的 null 字节报错 (`
87b32e`)

### 📦 其他 (Other)

- 将项目迁移到 wxs0625/Chat2API-WXS 仓库，清除 xiaoY233 源仓库信息 (`
ce2b9f`)
