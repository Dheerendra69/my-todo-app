import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { TasksService } from './tasks.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskPriorityDto } from './dto/update-task-priority.dto';
import { UpdateTaskAssigneeDto } from './dto/update-task-assignee.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Get()
  findAll(@Query() query: TaskQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id/subtasks')
  findSubtasks(@Param('id') id: string) {
    return this.tasksService.findSubtasks(id);
  }

  @Post(':id/subtasks')
  createSubtask(@Param('id') id: string, @Body() dto: CreateSubtaskDto) {
    return this.tasksService.createSubtask(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.tasksService.updateStatus(id, dto);
  }

  @Patch(':id/priority')
  updatePriority(@Param('id') id: string, @Body() dto: UpdateTaskPriorityDto) {
    return this.tasksService.updatePriority(id, dto);
  }

  @Patch(':id/assignee')
  updateAssignee(@Param('id') id: string, @Body() dto: UpdateTaskAssigneeDto) {
    return this.tasksService.updateAssignee(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
