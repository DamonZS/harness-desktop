import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

interface Step {
  name: string
  run?: string
  with?: Record<string, string>
}
interface Job {
  needs?: string[]
  if?: string
  steps: Step[]
}
const workflow = load(readFileSync(new URL('../../../.github/workflows/desktop-release.yml', import.meta.url), 'utf8')) as {
  on: { push: { branches: string[] }; workflow_dispatch: unknown }
  concurrency: { 'cancel-in-progress': boolean }
  jobs: Record<string, Job>
}

describe('desktop release workflow', () => {
  it('runs on main, builds the triggering source and requires both platforms before publication', () => {
    expect(workflow.on.push.branches).toContain('main')
    expect(workflow.concurrency['cancel-in-progress']).toBe(false)
    for (const platform of ['windows', 'macos']) {
      expect(workflow.jobs[platform]!.steps[0]!.with?.ref).toBe('${{ github.sha }}')
      const node = workflow.jobs[platform]!.steps.find(step => step.name === 'Set up Node.js')!
      expect(node.with?.['node-version']).toBe('22.23.2')
    }
    expect(workflow.jobs.release!.needs).toEqual(['create-version-tag', 'windows', 'macos'])
    expect(workflow.jobs.release!.if).toBeUndefined()
    const publish = workflow.jobs.release!.steps.find(step => step.name === 'Publish GitHub release assets')!.run!
    for (const asset of ['windows-x64-setup.exe', 'windows-x64.msi', 'macos-arm64.dmg']) expect(publish).toContain(asset)
    expect(publish).toContain('--draft')
    expect(publish).toContain('test "$count" -eq 3')
  })

  it('uses packaging commands declared at the repository root', () => {
    const root = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> }
    const desktop = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> }
    for (const platform of ['windows', 'macos']) {
      const command = workflow.jobs[platform]!.steps.find(step => step.name.startsWith('Build '))!.run!
      const name = command.replace('pnpm run ', '')
      expect(root.scripts[name]).toBeDefined()
      const leaf = root.scripts[name]!.split(' run ')[1]!
      expect(desktop.scripts[leaf]).toContain('--unsigned')
    }
  })

  it.each([
    { releases: 'v0.01\nv0.02', requested: '', expected: 'v0.03' },
    { releases: 'v0.01\nv0.02\nv0.03', requested: '', expected: 'v0.04' },
    { releases: '', requested: '', expected: 'v0.01' },
    { releases: 'v0.09', requested: '', expected: 'v0.10' },
    { releases: 'v0.99', requested: '', expected: 'v1.00' },
    { releases: 'v0.02', requested: 'v0.03', expected: 'v0.03' },
  ])('selects $expected from published versions without creating a tag', ({ releases, requested, expected }) => {
    expect(selectVersion(releases, requested)).toBe(`tag=${expected}\n`)
  })

  it('rejects an already published version and invalid version input', () => {
    expect(() => selectVersion('v0.03', 'v0.03')).toThrow()
    expect(() => selectVersion('v0.02', 'v0.03; echo unexpected')).toThrow()
  })
})

function selectVersion(releases: string, requested: string): string {
  const directory = mkdtempSync(join(tmpdir(), 'desktop-version-'))
  const output = join(directory, 'output')
  const bash = process.platform === 'win32'
    ? resolve(dirname(execFileSync('where.exe', ['git.exe'], { encoding: 'utf8' }).trim().split(/\r?\n/u)[0]!), '../bin/bash.exe')
    : 'bash'
  const script = workflow.jobs['create-version-tag']!.steps.find(step => step.run !== undefined)!.run!
  try {
    execFileSync(bash, ['-e', '-o', 'pipefail', '-c', `gh() { printf '%s\\n' "$TEST_RELEASES"; }\ngit() { exit 99; }\n${script}`], {
      env: { ...process.env, TEST_RELEASES: releases, REQUESTED_VERSION: requested, REF_TYPE: 'branch', GITHUB_OUTPUT: output.replaceAll('\\', '/') },
      stdio: 'pipe',
    })
    return readFileSync(output, 'utf8')
  } finally { rmSync(directory, { recursive: true, force: true }) }
}
