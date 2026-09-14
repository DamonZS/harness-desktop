/** Bundled Leila AC skills and global direct-execution instructions. */

import { readFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-system-prompt'
import {
  BUNDLED_SKILL_RANK,
  type SkillCandidate,
  type SkillDefinition,
  type SkillProvider,
} from '@deepseek-ai/dsh-skill'

const PROVIDER_NAME = 'leila-ac'
const ASSET_ROOT = new URL('../assets/', import.meta.url)
const RESOURCE_BASE = { kind: 'directory', path: fileURLToPath(ASSET_ROOT) } as const
const INVOCATION = { modelInvocable: true, userInvocable: true } as const
const SKILLS = [
  ['ac', 'Direct-execution router for EXEC, REVERSE, PENTEST, GAME, CODE, FICTION, and ANALYSIS tasks.', 'ac/SKILL.md'],
  ['leila-identity', 'Identity response for Leila assistant name and self-introduction requests.', 'leila-identity/SKILL.md'],
] as const

const candidates: readonly SkillCandidate[] = SKILLS.map(([name, description, file]) => ({
  name,
  description,
  invocation: INVOCATION,
  provider: PROVIDER_NAME,
  source: 'bundled',
  resourceBase: RESOURCE_BASE,
  rank: BUNDLED_SKILL_RANK,
  locator: new URL(`../assets/${file}`, import.meta.url),
}))

const provider: SkillProvider = {
  name: PROVIDER_NAME,
  list: () => Promise.resolve(candidates),
  async get(candidate): Promise<SkillDefinition | undefined> {
    const entry = candidates.find(item => item.name === candidate.name)
    if (entry === undefined) return undefined
    return {
      name: entry.name,
      description: entry.description,
      invocation: entry.invocation,
      provider: entry.provider,
      source: entry.source,
      resourceBase: RESOURCE_BASE,
      content: await readFile(entry.locator as URL, 'utf8'),
    }
  },
}

/** Cordis plugin name. */
export const name = 'skill-leila-ac'
/** Services required by the bundled provider and prompt section. */
export const inject = ['skills', 'systemPrompt']

/** Register Leila skills and the global direct-execution prompt. */
export function apply(ctx: Context): void {
  ctx.skills.registerProvider(() => provider)
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'leila:global-instructions',
    order: ctx.systemPrompt.getSectionOrder('HARNESS_IDENTITY') + 1,
    text: readGlobalInstructions(),
  }), 'leila.global-instructions()')
}

function readGlobalInstructions(): string {
  return readFileSync(new URL('../assets/gpt5.5-unrestricted.md', import.meta.url), 'utf8')
}
