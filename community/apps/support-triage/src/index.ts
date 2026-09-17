import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod/v3'
import type { XpertPlugin } from '@xpert-ai/plugin-sdk'
import { SupportTriagePlugin } from './lib/support-triage.plugin'
import { supportTriageTemplates } from './lib/support-triage.templates'

const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8')) as { name: string; version: string }
const ConfigSchema = z.object({ debug: z.boolean().default(false) }).strict()
const plugin: XpertPlugin<z.infer<typeof ConfigSchema>> = {
  meta: {
    name: packageJson.name, version: packageJson.version, level: 'system', artifactNamespace: 'support_triage', category: 'middleware',
    displayName: 'Support Triage Hub', author: 'Interview Candidate', description: 'Create, AI-triage, review and recover customer-support tickets.',
    targetApps: ['data-xpert'], targetAppMeta: { 'data-xpert': { types: ['workbench-view', 'assistant-tool', 'business-app'], capabilities: ['support_triage', 'support-ticket-review'], runtime: { middlewareProviders: ['SupportTriageMiddleware'], viewProviders: ['support_triage'], templateProviders: ['supportTriageTemplates'] } } }
  },
  config: { schema: ConfigSchema, defaults: { debug: false } }, templates: supportTriageTemplates,
  register(ctx) { ctx.logger.log('register support-triage'); return { module: SupportTriagePlugin, global: true } }
}
export default plugin
