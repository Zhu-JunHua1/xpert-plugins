import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SupportTicket, TicketPriority } from './ticket.entity'

export interface TicketScope { tenantId?: string; organizationId?: string; userId?: string }
export interface TriageInput { customerName?: string; subject: string; description: string; category: string; priority: TicketPriority; suggestedTeam: string; suggestedReply: string; rationale: string; confidence: number }

@Injectable()
export class SupportTriageService {
  constructor(@InjectRepository(SupportTicket) private readonly tickets: Repository<SupportTicket>) {}
  async create(input: TriageInput, scope: TicketScope) {
    if (!input.description.trim()) throw new BadRequestException('description is required')
    const now = new Date()
    return this.tickets.save(this.tickets.create({ ...input, tenantId: scope.tenantId, organizationId: scope.organizationId, createdById: scope.userId, ticketNo: `ST-${now.toISOString().slice(0, 10).replaceAll('-', '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, status: 'pending_review', revision: 1, retryCount: 0 }))
  }
  async list(scope: TicketScope, page = 1, pageSize = 20) {
    const where = { tenantId: scope.tenantId, organizationId: scope.organizationId }
    const [items, total] = await this.tickets.findAndCount({ where, order: { createdAt: 'DESC', id: 'DESC' }, take: pageSize, skip: (page - 1) * pageSize })
    return { items: items.map((item) => this.summary(item)), total, page, pageSize }
  }
  async retry(id: string, scope: TicketScope) {
    const ticket = await this.tickets.findOne({ where: { id, tenantId: scope.tenantId, organizationId: scope.organizationId } })
    if (!ticket) throw new NotFoundException('ticket_not_found')
    if (ticket.status !== 'failed') throw new BadRequestException('only_failed_ticket_can_retry')
    ticket.status = 'pending_review'; ticket.failureCode = null; ticket.failureMessage = null; ticket.retryCount = (ticket.retryCount ?? 0) + 1; ticket.revision = (ticket.revision ?? 0) + 1
    return this.tickets.save(ticket)
  }
  async recordFailure(id: string, failureCode: string, failureMessage: string, scope: TicketScope) {
    const ticket = await this.tickets.findOne({ where: { id, tenantId: scope.tenantId, organizationId: scope.organizationId } })
    if (!ticket) throw new NotFoundException('ticket_not_found')
    ticket.status = 'failed'; ticket.failureCode = failureCode; ticket.failureMessage = failureMessage; ticket.revision = (ticket.revision ?? 0) + 1
    return this.tickets.save(ticket)
  }
  summary(ticket: SupportTicket) { return { id: ticket.id, ticketNo: ticket.ticketNo, status: ticket.status, subject: ticket.subject, category: ticket.category, priority: ticket.priority, suggestedTeam: ticket.suggestedTeam, confidence: ticket.confidence, retryCount: ticket.retryCount, createdAt: ticket.createdAt } }
}
