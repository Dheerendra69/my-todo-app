import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Task } from '../entities/task.entity';

import { CollaborationGateway } from './collaboration.gateway';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Task])],
  providers: [CollaborationGateway],
  exports: [CollaborationGateway],
})
export class CollaborationModule {}
