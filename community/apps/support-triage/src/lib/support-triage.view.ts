import { Injectable } from '@nestjs/common'
import type { I18nObject, XpertExtensionViewManifest, XpertResolvedViewHostContext, XpertViewActionRequest, XpertViewActionResult, XpertViewDataResult, XpertViewQuery } from '@xpert-ai/contracts'
import { IXpertViewExtensionProvider, ViewExtensionProvider } from '@xpert-ai/plugin-sdk'
import { SUPPORT_TRIAGE_FEATURE, SUPPORT_TRIAGE_PLUGIN_NAME, SUPPORT_TRIAGE_PROVIDER_KEY, SUPPORT_TRIAGE_VIEW_KEY } from './constants'
import { SupportTriageService } from './support-triage.service'
const text = (en_US: string, zh_Hans: string): I18nObject => ({ en_US, zh_Hans })
@Injectable()
@ViewExtensionProvider(SUPPORT_TRIAGE_PROVIDER_KEY)
export class SupportTriageViewProvider implements IXpertViewExtensionProvider {
  constructor(private readonly service: SupportTriageService) {}
  supports(context: XpertResolvedViewHostContext) { return context.hostType === 'agent' }
  getViewManifests(_context: XpertResolvedViewHostContext, slot: string): XpertExtensionViewManifest[] {
    if (slot !== 'agent.workbench.main' && slot !== 'agent.workbench.fixed') return []
    return [{ key: SUPPORT_TRIAGE_VIEW_KEY, title: text('Support Triage Hub', '智能工单分诊台'), description: text('Review AI-assisted customer-support triage results.', '审核 AI 辅助生成的客服工单分诊结果。'), hostType: 'agent', slot, order: 30, refreshable: true, activation: { requiredFeatures: [SUPPORT_TRIAGE_FEATURE] }, source: { provider: SUPPORT_TRIAGE_PROVIDER_KEY, plugin: SUPPORT_TRIAGE_PLUGIN_NAME }, view: { type: 'table' }, dataSource: { mode: 'platform', querySchema: { supportsPagination: true, defaultPageSize: 20 } }, actions: [{ key: 'retry_ticket', label: text('Retry', '重试'), actionType: 'invoke', placement: 'row' }] } as XpertExtensionViewManifest]
  }
  async getViewData(context: XpertResolvedViewHostContext, viewKey: string, query: XpertViewQuery): Promise<XpertViewDataResult> {
    if (viewKey !== SUPPORT_TRIAGE_VIEW_KEY) return {}
    return this.service.list({ tenantId: context.tenantId, organizationId: context.organizationId, userId: context.userId }, query.page ?? 1, query.pageSize ?? 20)
  }
  async executeViewAction(context: XpertResolvedViewHostContext, viewKey: string, actionKey: string, request: XpertViewActionRequest): Promise<XpertViewActionResult> {
    if (viewKey !== SUPPORT_TRIAGE_VIEW_KEY || actionKey !== 'retry_ticket' || !request.targetId) return { success: false, message: text('Unsupported action', '不支持的操作') }
    await this.service.retry(request.targetId, { tenantId: context.tenantId, organizationId: context.organizationId, userId: context.userId })
    return { success: true, refresh: true, message: text('Ticket is ready for retry.', '工单已恢复，可重新分诊。') }
  }
}
