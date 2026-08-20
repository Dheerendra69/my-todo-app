import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';

import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Project])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
