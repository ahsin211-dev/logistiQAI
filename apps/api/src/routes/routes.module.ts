import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [RoutesController],
})
export class RoutesModule {}
