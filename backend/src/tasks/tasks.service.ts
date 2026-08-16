import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task, TaskPriority, TaskStatus } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskPriorityDto } from './dto/update-task-priority.dto';
import { UpdateTaskAssigneeDto } from './dto/update-task-assignee.dto';
import { TaskQueryDto } from './dto/task-query.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateTaskDto) {
    const project = await this.projectRepository.findOne({
      where: { id: dto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    let assignee: User | null = null;

    if (dto.assigneeId) {
      assignee = await this.userRepository.findOne({
        where: { id: dto.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
    }

    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      project,
      assignee: assignee ?? undefined,
    });

    return this.taskRepository.save(task);
  }

  async findAll(query: TaskQueryDto) {
    const {
      status,
      priority,
      assignee,
      project,
      search,
      page = 1,
      limit = 10,
    } = query;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignee', 'assignee');

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (assignee) {
      queryBuilder.andWhere('assignee.id = :assignee', { assignee });
    }

    if (project) {
      queryBuilder.andWhere('project.id = :project', { project });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    queryBuilder
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [tasks, total] = await queryBuilder.getManyAndCount();

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: {
        project: true,
        assignee: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.findOne(id);

    Object.assign(task, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : task.dueDate,
    });

    return this.taskRepository.save(task);
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto) {
    const task = await this.findOne(id);

    task.status = dto.status;

    return this.taskRepository.save(task);
  }

  async updatePriority(id: string, dto: UpdateTaskPriorityDto) {
    const task = await this.findOne(id);

    task.priority = dto.priority;

    return this.taskRepository.save(task);
  }

  async updateAssignee(id: string, dto: UpdateTaskAssigneeDto) {
    const task = await this.findOne(id);

    if (!dto.assigneeId) {
      task.assignee = null;
      return this.taskRepository.save(task);
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.assigneeId },
    });

    if (!user) {
      throw new NotFoundException('Assignee not found');
    }

    task.assignee = user;

    return this.taskRepository.save(task);
  }

  async remove(id: string) {
    const task = await this.findOne(id);

    await this.taskRepository.remove(task);

    return {
      message: 'Task deleted successfully',
    };
  }
}
