import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuditService } from './audit.service';
import { AuditProcessor } from './audit.processor';
import { AuditListener } from './audit.listener';
import { AuditController } from './audit.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'audit' })],
  controllers: [AuditController],
  providers: [AuditService, AuditProcessor, AuditListener],
  exports: [AuditService],
})
export class AuditModule {}
