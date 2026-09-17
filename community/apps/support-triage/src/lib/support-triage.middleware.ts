import { Injectable } from '@nestjs/common'
import { tool } from '@langchain/core/tools'
import type { TAgentMiddlewareMeta } from '@xpert-ai/contracts'
import { AgentMiddlewareStrategy, IAgentMiddlewareContext, IAgentMiddlewareStrategy, PromiseOrValue, AgentMiddleware } from '@xpert-ai/plugin-sdk'
import { z } from 'zod/v3'
import { SUPPORT_TRIAGE_FEATURE } from './constants'
import { SupportTriageService } from './support-triage.service'
const createSchema = z.object({ customerName: z.string().trim().max(120).optional(), subject: z.string().trim().min(3).max(160), description: z.string().trim().min(10).max(4000), category: z.string().trim().min(2).max(80), priority: z.enum(['low', 'medium', 'high', 'urgent']), suggestedTeam: z.string().trim().min(2).max(100), suggestedReply: z.string().trim().min(5).max(1200), rationale: z.string().trim().min(5).max(800), confidence: z.number().min(0).max(1) }).strict()
const listSchema = z.object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(50).default(20) }).strict()
const retrySchema = z.object({ ticketId: z.string().uuid() }).strict()
const failureSchema = z.object({ ticketId: z.string().uuid(), failureCode: z.string().trim().min(3).max(80), failureMessage: z.string().trim().min(3).max(500) }).strict()
@Injectable()
@AgentMiddlewareStrategy('SupportTriageMiddleware')
export class SupportTriageMiddleware implements IAgentMiddlewareStrategy<Record<string, never>> {
  meta: TAgentMiddlewareMeta = { name: 'SupportTriageMiddleware', label: { en_US: 'Support triage', zh_Hans: '智能工单分诊' }, description: { en_US: 'Create and recover AI-triaged support tickets.', zh_Hans: '创建并恢复 AI 分诊后的客服工单。' }, features: [SUPPORT_TRIAGE_FEATURE], configSchema: { type: 'object', properties: {}, required: [] } }
  constructor(private readonly service: SupportTriageService) {}
  createMiddleware(_options: Record<string, never>, context: IAgentMiddlewareContext): PromiseOrValue<AgentMiddleware> {
    const scope = { tenantId: context.tenantId, organizationId: context.organizationId, userId: context.userId }
    return { name: 'SupportTriageMiddleware', tools: [
      tool(async (input: z.infer<typeof createSchema>) => JSON.stringify({ success: true, data: this.service.summary(await this.service.create({ customerName: input.customerName, subject: input.subject!, description: input.description!, category: input.category!, priority: input.priority!, suggestedTeam: input.suggestedTeam!, suggestedReply: input.suggestedReply!, rationale: input.rationale!, confidence: input.confidence! }, scope)), nextAction: 'Ask a human reviewer to confirm or amend the triage.' }), { name: 'support_triage_create_ticket', description: 'After analyzing one customer issue, save one reviewable support ticket. Do not claim the ticket was assigned or replied to.', schema: createSchema, verboseParsingErrors: true, metadata: { toolName: { en_US: 'Create triaged ticket', zh_Hans: '创建分诊工单' } } }),
      tool(async (input: z.infer<typeof listSchema>) => JSON.stringify({ success: true, data: await this.service.list(scope, input.page, input.pageSize) }), { name: 'support_triage_list_tickets', description: 'List persisted support-ticket summaries in the current organization.', schema: listSchema, verboseParsingErrors: true, metadata: { toolName: { en_US: 'List support tickets', zh_Hans: '查看支持工单' } } }),
      tool(async (input: z.infer<typeof failureSchema>) => JSON.stringify({ success: true, data: this.service.summary(await this.service.recordFailure(input.ticketId, input.failureCode, input.failureMessage, scope)), nextAction: 'A human may retry the failed ticket without creating a duplicate.' }), { name: 'support_triage_record_failure', description: 'Record a non-sensitive AI-provider or structured-processing failure for an existing ticket. Do not include tokens, stack traces, or customer secrets.', schema: failureSchema, verboseParsingErrors: true, metadata: { toolName: { en_US: 'Record triage failure', zh_Hans: '记录分诊失败' } } }),
      tool(async (input: z.infer<typeof retrySchema>) => JSON.stringify({ success: true, data: this.service.summary(await this.service.retry(input.ticketId, scope)), nextAction: 'Run triage again using the preserved customer description.' }), { name: 'support_triage_retry_ticket', description: 'Retry a ticket that previously failed AI processing. This only resets its review state and is idempotent per human retry decision.', schema: retrySchema, verboseParsingErrors: true, metadata: { toolName: { en_US: 'Retry failed ticket', zh_Hans: '重试失败工单' } } })
    ] }
  }
}
