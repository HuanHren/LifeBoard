import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const errors = []

const requiredFiles = [
  'docs/lb-3a-weather-completion-audit.md',
  'docs/lb-3a-weather-definition-of-done.md',
  'docs/lb-3a-weather-closeout-roadmap.md',
  'docs/lb-3a-weather-issue-matrix.csv',
  'docs/weather-scene-architecture.md',
  'scripts/lb-3a-validate-weather-completion-audit.mjs',
]

function read(relPath) {
  return readFileSync(join(root, relPath), 'utf8')
}

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    errors.push(`${file} is missing`)
  }
}

const audit = existsSync(join(root, requiredFiles[0])) ? read(requiredFiles[0]) : ''
const dod = existsSync(join(root, requiredFiles[1])) ? read(requiredFiles[1]) : ''
const roadmap = existsSync(join(root, requiredFiles[2])) ? read(requiredFiles[2]) : ''
const matrix = existsSync(join(root, requiredFiles[3])) ? read(requiredFiles[3]) : ''
const architecture = existsSync(join(root, requiredFiles[4])) ? read(requiredFiles[4]) : ''

for (const token of [
  'P0: none',
  'Recommended next stage: LB-3C',
  'No additional Xiaomi Weather reverse engineering is required',
  'mixed renderer',
  'clear-day',
  'Legacy',
  'partly-cloudy-day',
  'authorized-vendor',
  'partly-cloudy-night',
  'config-driven',
]) {
  if (!audit.includes(token)) {
    errors.push(`audit is missing required token: ${token}`)
  }
}

for (const section of ['Functional', 'Visual', 'Reliability', 'Accessibility', 'Scope']) {
  if (!dod.includes(`## ${section}`)) {
    errors.push(`definition of done is missing ${section}`)
  }
}

const stageCount = (roadmap.match(/^## LB-3/gm) ?? []).length
if (stageCount > 4) {
  errors.push(`roadmap has too many stages: ${stageCount}`)
}
if (!roadmap.includes('Recommended next stage: LB-3C')) {
  errors.push('roadmap does not recommend LB-3C')
}
if (!roadmap.includes('No LB-2F clear-day migration')) {
  errors.push('roadmap does not explicitly stop clear-day migration')
}

const priorities = [...matrix.matchAll(/,((?:P0|P1|P2|DROP)),/g)].map((match) => match[1])
if (priorities.length === 0) {
  errors.push('issue matrix has no priority rows')
}
const unknownPriority = matrix
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .find((line) => !/,((?:P0|P1|P2|DROP)),/.test(line))
if (unknownPriority) {
  errors.push(`issue matrix has an invalid priority row: ${unknownPriority}`)
}
const p0Count = priorities.filter((priority) => priority === 'P0').length
const p1Count = priorities.filter((priority) => priority === 'P1').length
if (p0Count > 5) {
  errors.push(`P0 count exceeds cap: ${p0Count}`)
}
if (p1Count > 8) {
  errors.push(`P1 count exceeds cap: ${p1Count}`)
}
if (p1Count === 0) {
  errors.push('P1 count should reflect the audit closeout items')
}

for (const token of [
  'mixed renderer is now the formal weather rendering architecture',
  '`clear-day` remains Legacy',
  'Stop unprofitable scene migration',
  'weather module is in closeout',
]) {
  if (!architecture.includes(token)) {
    errors.push(`architecture doc is missing LB-3A update token: ${token}`)
  }
}

const allowedChangedPaths = new Set(requiredFiles)
const allowedPrefix = /^docs\/lb-3a-|^scripts\/lb-3a-|^docs\/weather-scene-architecture\.md$/
const isPostLb3cCloseout = existsSync(join(root, 'docs/lb-3c-weather-p1-closeout.md'))

function gitLines(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

const changedPaths = [
  ...gitLines(['diff', '--name-only', '--diff-filter=ACMRTUXB', 'HEAD', '--']),
  ...gitLines(['ls-files', '--others', '--exclude-standard']),
]

for (const changedPath of changedPaths) {
  const normalized = changedPath.replace(/\\/g, '/')
  if (
    !isPostLb3cCloseout &&
    !allowedChangedPaths.has(normalized) &&
    !allowedPrefix.test(normalized)
  ) {
    errors.push(`unexpected changed path for LB-3A audit scope: ${normalized}`)
  }
  if (
    !isPostLb3cCloseout &&
    /^(src|public|package\.json|package-lock\.json|vite\.config|tsconfig)/.test(normalized)
  ) {
    errors.push(`production/dependency path changed during audit: ${normalized}`)
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log('LB-3A weather completion audit validation PASS')
