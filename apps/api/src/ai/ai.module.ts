import { Module } from '@nestjs/common';
import { AiOrchestrationService } from './ai-orchestration.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiOrchestrationService],
  exports: [AiOrchestrationService],
})
export class AiModule {}
