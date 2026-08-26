import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { TasksService } from './tasks.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskPriorityDto } from './dto/update-task-priority.dto';
import { UpdateTaskAssigneeDto } from './dto/update-task-assignee.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateTaskDto, @Req() req: AuthenticatedRequest) {
    return this.tasksService.create(dto, req.user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() query: TaskQueryDto, @Req() req: AuthenticatedRequest) {
    return this.tasksService.findAll(query, req.user.sub);
  }

  @Get(':id/subtasks')
  findSubtasks(@Param('id') id: string) {
    return this.tasksService.findSubtasks(id);
  }

  @Post(':id/subtasks')
  @UseGuards(JwtAuthGuard)
  createSubtask(
    @Param('id') id: string,
    @Body() dto: CreateSubtaskDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tasksService.createSubtask(id, dto, req.user.sub);
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
