import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { AiModule } from '../ai/ai.module';
import { FleetModule } from '../fleet/fleet.module';

@Module({
  imports: [AiModule, FleetModule],
  controllers: [DispatchController],
})
export class DispatchModule {}
