#!/usr/bin/env node
/**
 * 自动版本发布脚本 (Auto Release)
 *
 * 用法：npm run release:auto
 *
 * 功能：
 *   1. 收集自上一个 git tag 以来的所有提交
 *   2. 依据 Conventional Commits 规范自动判断版本升级幅度：
 *        feat:            → 次版本号 +1  (1.4.0 → 1.5.0)
 *        fix:             → 补丁号   +1  (1.4.0 → 1.4.1)
 *        BREAKING CHANGE / feat! / fix! → 主版本号 +1 (1.4.0 → 2.0.0)
 *        其他类型(无 feats/fixes 时)     → 补丁号 +1
 *   3. 自动生成 / 更新 CHANGELOG.md（按类型分组）
 *   4. 更新 package.json 版本号
 *   5. 提交、打 tag、推送（触发 GitHub Actions 构建发布）
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const PKG_PATH = path.join(ROOT, 'package.json')
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md')

function run(cmd, options = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', ...options })
}

function safeRun(cmd) {
  try {
    return { ok: true, out: run(cmd).trim() }
  } catch {
    return { ok: false, out: '' }
  }
}

/** 提交类型 → CHANGELOG 分组标题 */
const TYPE_HEADINGS = {
  feat: '### ✨ 新功能 (Features)',
  fix: '### 🐛 修复 (Bug Fixes)',
  perf: '### ⚡ 性能优化 (Performance)',
  refactor: '### ♻️ 重构 (Refactoring)',
  docs: '### 📝 文档 (Documentation)',
  test: '### ✅ 测试 (Tests)',
  build: '### 🛠 构建 (Build)',
  ci: '### 🔧 持续集成 (CI)',
  chore: '### 🧹 杂项 (Chores)',
}

/** 排序：按上面定义的优先级展示 */
const TYPE_ORDER = [
  'feat',
  'fix',
  'perf',
  'refactor',
  'docs',
  'test',
  'build',
  'ci',
  'chore',
]

function parseCommits(range) {
  const fieldSep = String.fromCharCode(31)
  const commitSep = String.fromCharCode(0)
  // 使用 git 的 %x1F / %x00 转义占位符在“输出时”生成分隔符，
  // 因为 Node 的 execSync 不允许命令字符串本身包含 null 字节。
  const raw = run(`git log ${range} --pretty=format:%H%x1F%s%x1F%b%x00`)
  const commits = []
  for (const chunk of raw.split(commitSep)) {
    if (!chunk.trim()) continue
    const [hash, subject, body] = chunk.split(fieldSep)
    commits.push({
      shortHash: (hash || '').slice(0, 7),
      subject: (subject || '').trim(),
      body: (body || '').trim(),
    })
  }
  return commits
}

/**
 * 解析提交并归类，同时计算版本升级级别。
 * level: 0=无变化, 1=patch, 2=minor, 3=major
 */
function classify(commits) {
  const groups = {
    feat: [],
    fix: [],
    perf: [],
    refactor: [],
    docs: [],
    test: [],
    build: [],
    ci: [],
    chore: [],
    other: [],
  }
  let level = 0

  for (const c of commits) {
    const full = `${c.subject}\n${c.body}`.trim()
    const isBreaking = /\bBREAKING[ -]CHANGE\b/i.test(full)
    const typeMatch = c.subject.match(/^(\w+)(\(.*?\))?(!)?:\s*/)

    if (!typeMatch) {
      groups.other.push(c)
      continue
    }

    const type = typeMatch[1].toLowerCase()
    const breakingBang = !!typeMatch[3] // 例如 feat!: 的感叹号
    const isBreakingChange = isBreaking || breakingBang

    if (isBreakingChange) {
      level = Math.max(level, 3)
    } else if (type === 'feat') {
      level = Math.max(level, 2)
    } else if (type === 'fix') {
      level = Math.max(level, 1)
    }

    const target = groups[type] ? type : 'other'
    const cleanSubject = c.subject.replace(/^\w+(\(.*?\))?!?:\s*/, '').trim()
    groups[target].push({ ...c, subject: cleanSubject, breaking: isBreakingChange })
  }

  return { groups, level }
}

function bumpVersion(version, level) {
  const core = version.split('-')[0]
  let [major, minor, patch] = core.split('.').map((n) => Number(n) || 0)
  if (level >= 3) {
    major += 1
    minor = 0
    patch = 0
  } else if (level === 2) {
    minor += 1
    patch = 0
  } else {
    patch += 1
  }
  return `${major}.${minor}.${patch}`
}

function renderChangeGroup(items) {
  return items
    .map((c) => {
      const breaking = c.breaking ? ' **（破坏性更改）**' : ''
      return `- ${c.subject}${breaking} (\`${c.shortHash}\`)`
    })
    .join('\n')
}

function buildChangelogEntry(newVersion, groups, level) {
  const date = new Date().toISOString().slice(0, 10)
  const header =
    level >= 3
      ? `## [${newVersion}] - ${date} — ⚠️ 破坏性版本`
      : `## [${newVersion}] - ${date}`

  const sections = []
  for (const type of TYPE_ORDER) {
    if (groups[type] && groups[type].length > 0) {
      sections.push(`${TYPE_HEADINGS[type]}\n\n${renderChangeGroup(groups[type])}`)
    }
  }
  if (groups.other && groups.other.length > 0) {
    sections.push(`### 📦 其他 (Other)\n\n${renderChangeGroup(groups.other)}`)
  }

  return `${header}\n\n${sections.join('\n\n')}`
}

function updateChangelog(entry) {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    fs.writeFileSync(
      CHANGELOG_PATH,
      '# 修改日志 (Changelog)\n\n本项目的所有重要变更都会记录在此文件中。\n\n' + entry + '\n'
    )
    return
  }

  const existing = fs.readFileSync(CHANGELOG_PATH, 'utf8')
  // 在标题区块之后插入新条目（保留开头两行标题 + 空行）
  const lines = existing.split('\n')
  let insertIndex = 0
  if (lines[0] && lines[0].startsWith('# ')) {
    insertIndex = 1
    // 跳过标题后的空行和可选说明段落
    while (insertIndex < lines.length && lines[insertIndex].trim() === '') {
      insertIndex++
    }
    // 若存在说明段落（非 ## 开头），跳过它
    while (insertIndex < lines.length && !lines[insertIndex].startsWith('## ')) {
      insertIndex++
    }
  }
  lines.splice(insertIndex, 0, entry + '\n')
  fs.writeFileSync(CHANGELOG_PATH, lines.join('\n'))
}

function main() {
  console.log('=' .repeat(50))
  console.log('Chat2API 自动版本发布')
  console.log('='.repeat(50))

  // 1. 检查工作区是否干净
  const status = safeRun('git status --porcelain')
  if (status.out.trim() !== '') {
    console.error('❌ 工作区有未提交的更改，请先提交或暂存 (git stash)。')
    console.error(status.out)
    process.exit(1)
  }
  console.log('✅ 工作区干净')

  // 2. 确定提交范围
  const lastTag = safeRun('git describe --tags --abbrev=0 HEAD')
  let range
  if (lastTag.ok && lastTag.out) {
    range = `${lastTag.out}..HEAD`
    console.log(`ℹ️  上一个版本 tag: ${lastTag.out}`)
  } else {
    // 没有 tag 时统计当前分支全部可达提交（含根提交）
    range = 'HEAD'
    console.log('ℹ️  未找到 tag，将统计当前分支全部提交')
  }

  const commits = parseCommits(range)
  if (commits.length === 0) {
    console.error('❌ 自上个版本以来没有新提交，无需发布。')
    process.exit(1)
  }
  console.log(`ℹ️  本次发布包含 ${commits.length} 个提交`)

  // 3. 分类并决定版本
  const { groups, level } = classify(commits)
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'))
  const oldVersion = pkg.version
  const newVersion = bumpVersion(oldVersion, level)

  const levelName =
    level >= 3 ? 'major (主版本)' : level === 2 ? 'minor (次版本)' : 'patch (补丁)'
  console.log(`\n版本升级：${oldVersion} → ${newVersion}  [${levelName}]`)

  // 4. 生成 CHANGELOG
  const entry = buildChangelogEntry(newVersion, groups, level)
  updateChangelog(entry)
  console.log('📝 已更新 CHANGELOG.md')

  // 5. 同步更新 package.json 与 package-lock.json 版本号
  // 使用 npm version 保证 lock 文件同步，否则 CI 中 npm ci 会因版本不一致而失败。
  run(`npm version ${newVersion} --no-git-tag-version --allow-same-version`)
  console.log(`📦 已同步 package.json 与 package-lock.json version → ${newVersion}`)

  // 6. 提交 + 打 tag + 推送
  console.log('\n--- 正在提交并打 tag ---')
  run(`git add package.json package-lock.json CHANGELOG.md`)
  run(`git commit -m "chore: release v${newVersion}"`)
  run(`git tag -a v${newVersion} -m "chore: release v${newVersion}"`)
  console.log(`🏷️  已创建 tag: v${newVersion}`)

  console.log('\n--- 推送到 GitHub ---')
  run(`git push origin HEAD`)
  run(`git push origin v${newVersion}`)

  console.log('\n' + '='.repeat(50))
  console.log(`🎉 发布完成：v${newVersion}`)
  console.log('='.repeat(50))
  console.log('\nGitHub Actions 正在构建并发布各平台安装包。')
  console.log('请稍后前往 Releases 页面查看产物。')
}

main()