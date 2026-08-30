import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Label } from '../entities/label.entity';
import { CollaborationModule } from '../collaboration/collaboration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Project, Label]),
    CollaborationModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
