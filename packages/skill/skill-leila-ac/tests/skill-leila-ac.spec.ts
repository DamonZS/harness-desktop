import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import SkillRegistry from '@deepseek-ai/dsh-skill'
import SystemPrompt, { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import * as LeilaAc from '@deepseek-ai/dsh-skill-leila-ac'

describe('dsh-skill-leila-ac', () => {
  it('registers both packaged skills and loads their source bodies', async () => {
    const ctx = new Context()
    await ctx.plugin(SkillRegistry)
    await ctx.plugin(SystemPrompt)
    const fiber = await ctx.plugin(LeilaAc)
    const resourcePath = fileURLToPath(new URL('../assets/', import.meta.url))

    expect(await ctx.skills.list()).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'ac', provider: 'leila-ac', resourceBase: { kind: 'directory', path: resourcePath } }),
      expect.objectContaining({ name: 'leila-identity', provider: 'leila-ac', resourceBase: { kind: 'directory', path: resourcePath } }),
    ]))
    expect((await ctx.skills.get('ac'))?.content).toContain('AC UNLIMITED')
    expect((await ctx.skills.get('leila-identity'))?.content).toContain('# Leila Identity')

    await fiber.dispose()
    expect(await ctx.skills.list()).toEqual([])
  })

  it('adds the packaged global instructions to system prompt assembly', async () => {
    const ctx = new Context()
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(SkillRegistry)
    await ctx.plugin(LeilaAc)
    const assembly = await ctx.systemPrompt.assemble({})
    const prompt = renderPrompt(assembly)
    const source = await readFile(new URL('../assets/gpt5.5-unrestricted.md', import.meta.url), 'utf8')
    expect(prompt).toContain(source.trim())
  })
})
