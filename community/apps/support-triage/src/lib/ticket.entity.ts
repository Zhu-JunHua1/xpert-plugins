import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { pluginArtifactTableName } from '@xpert-ai/plugin-sdk'
import { SUPPORT_TRIAGE_NAMESPACE } from './constants'
export type TicketStatus = 'pending_review' | 'triaged' | 'failed' | 'confirmed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export const SUPPORT_TICKET_TABLE = pluginArtifactTableName(SUPPORT_TRIAGE_NAMESPACE, 'ticket')
@Entity(SUPPORT_TICKET_TABLE)
@Index(['tenantId', 'organizationId', 'status', 'createdAt'])
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid') id?: string
  @Column({ type: 'varchar', nullable: true }) tenantId?: string
  @Column({ type: 'varchar', nullable: true }) organizationId?: string
  @Column({ type: 'varchar', nullable: true }) createdById?: string
  @Column({ type: 'varchar' }) ticketNo?: string
  @Column({ type: 'varchar', default: 'pending_review' }) status?: TicketStatus
  @Column({ type: 'varchar', nullable: true }) customerName?: string
  @Column({ type: 'varchar' }) subject?: string
  @Column({ type: 'text' }) description?: string
  @Column({ type: 'varchar', nullable: true }) category?: string
  @Column({ type: 'varchar', nullable: true }) priority?: TicketPriority
  @Column({ type: 'varchar', nullable: true }) suggestedTeam?: string
  @Column({ type: 'text', nullable: true }) suggestedReply?: string
  @Column({ type: 'text', nullable: true }) rationale?: string
  @Column({ type: 'float', nullable: true }) confidence?: number
  @Column({ type: 'text', nullable: true }) failureCode?: string
  @Column({ type: 'text', nullable: true }) failureMessage?: string
  @Column({ type: 'int', default: 0 }) retryCount?: number
  @Column({ type: 'int', default: 1 }) revision?: number
  @CreateDateColumn({ type: 'timestamptz' }) createdAt?: Date
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt?: Date
}
