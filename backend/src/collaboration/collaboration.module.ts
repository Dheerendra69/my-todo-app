import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Task } from '../entities/task.entity';

import { CollaborationGateway } from './collaboration.gateway';
import { User } from '../entities/user.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Task, User])],
  providers: [CollaborationGateway],
  exports: [CollaborationGateway],
})
export class CollaborationModule {}
