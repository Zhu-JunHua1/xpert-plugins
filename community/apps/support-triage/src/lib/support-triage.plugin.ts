import { TypeOrmModule } from '@nestjs/typeorm'
import { XpertServerPlugin } from '@xpert-ai/plugin-sdk'
import { SupportTriageMiddleware } from './support-triage.middleware'
import { SupportTriageService } from './support-triage.service'
import { SupportTriageViewProvider } from './support-triage.view'
import { SupportTicket } from './ticket.entity'
@XpertServerPlugin({ imports: [TypeOrmModule.forFeature([SupportTicket])], entities: [SupportTicket], providers: [SupportTriageService, SupportTriageMiddleware, SupportTriageViewProvider], exports: [SupportTriageService] })
export class SupportTriagePlugin {}
