import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { XpertTypeEnum } from '@xpert-ai/contracts'
import type { XpertTemplateContribution } from '@xpert-ai/plugin-sdk'
const readDsl = () => { const paths = [join(__dirname, '..', 'xpert-support-triage-assistant.yaml'), join(process.cwd(), 'community/apps/support-triage/src/xpert-support-triage-assistant.yaml')]; const path = paths.find(existsSync); if (!path) throw new Error('support-triage assistant template not found'); return readFileSync(path, 'utf8') }
export const supportTriageTemplates: XpertTemplateContribution[] = [{ key: 'support-triage-assistant', name: 'Support Triage Assistant', title: '智能工单分诊助手', description: '将客户问题保存为 AI 分诊建议，交由人工确认。', category: 'Support', type: XpertTypeEnum.Agent, targetApps: ['data-xpert'], targetAppMeta: { 'data-xpert': { types: ['business-assistant'], capabilities: ['support_triage'], requiredPlugins: ['@xpert-ai/plugin-support-triage'] } }, dslContent: readDsl(), providerKey: 'supportTriageTemplates', startPrompts: ['请将这条客户问题创建为待人工确认的分诊工单。', '请查看当前支持工单。'], default: false } as XpertTemplateContribution]
