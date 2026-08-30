import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Task, TaskPriority, TaskStatus } from '../entities/task.entity';
import { Label } from '../entities/label.entity';

import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskPriorityDto } from './dto/update-task-priority.dto';
import { UpdateTaskAssigneeDto } from './dto/update-task-assignee.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CollaborationGateway } from '../collaboration/collaboration.gateway';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,

    private readonly collaborationGateway: CollaborationGateway,
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    const project = await this.projectRepository.findOne({
      where: {
        id: dto.projectId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let members: User[] = [];

    if (dto.memberIds?.length) {
      const uniqueMemberIds = [...new Set(dto.memberIds)];

      members = await this.userRepository.find({
        where: {
          id: In(uniqueMemberIds),
        },
      });

      if (members.length !== uniqueMemberIds.length) {
        throw new NotFoundException('One or more members were not found');
      }
    }

    const isCreatorAlreadyMember = members.some(
      (member) => member.id === user.id,
    );

    if (!isCreatorAlreadyMember) {
      members.push(user);
    }

    let assignee: User | null = null;

    if (dto.assigneeId) {
      assignee = await this.userRepository.findOne({
        where: {
          id: dto.assigneeId,
        },
      });

      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
    } else {
      assignee = user;
    }

    let parentTask: Task | null = null;

    if (dto.parentTaskId) {
      parentTask = await this.taskRepository.findOne({
        where: {
          id: dto.parentTaskId,
        },
        relations: {
          project: true,
        },
      });

      if (!parentTask) {
        throw new NotFoundException('Parent task not found');
      }

      if (parentTask?.project?.id !== project.id) {
        throw new NotFoundException(
          'Parent task belongs to a different project',
        );
      }
    }

    let labels: Label[] = [];

    if (dto.labels?.length) {
      for (const labelName of dto.labels) {
        const trimmedName = labelName.trim();

        if (!trimmedName) {
          continue;
        }

        let label = await this.labelRepository.findOne({
          where: {
            name: trimmedName,
          },
        });

        if (!label) {
          label = this.labelRepository.create({
            name: trimmedName,
          });

          label = await this.labelRepository.save(label);
        }

        labels.push(label);
      }
    }

    const task = this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.TODO,
      priority: dto.priority ?? TaskPriority.NO_PRIORITY,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      project,
      assignee,
      parentTask,
      labels,
      members,
    });

    const savedTask = await this.taskRepository.save(task);

    return this.findOne(savedTask?.id);
  }

  async findAll(query: TaskQueryDto, userId: string) {
    const {
      status,
      priority,
      assignee,
      project,
      search,
      page = 1,
      limit = 100,
    } = query;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.members', 'members')
      .leftJoinAndSelect('task.parentTask', 'parentTask')
      .leftJoinAndSelect('task.labels', 'labels')
      .where('task.parentTask IS NULL')
      .andWhere('(assignee.id = :userId OR members.id = :userId)', {
        userId,
      });

    if (status) {
      queryBuilder.andWhere('task.status = :status', {
        status,
      });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', {
        priority,
      });
    }

    if (assignee) {
      queryBuilder.andWhere('assignee.id = :assignee', {
        assignee,
      });
    }

    if (project) {
      queryBuilder.andWhere('project.id = :project', {
        project,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        `
        (
          LOWER(task.title) LIKE LOWER(:search)
          OR LOWER(task.description) LIKE LOWER(:search)
        )
      `,
        {
          search: `%${search}%`,
        },
      );
    }

    queryBuilder
      .distinct(true)
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

  async findOne(id: string | undefined) {
    const task = await this.taskRepository.findOne({
      where: {
        id,
      },
      relations: {
        project: true,
        assignee: true,
        members: true,
        parentTask: true,
        labels: true,
        subtasks: {
          assignee: true,
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async findSubtasks(taskId: string) {
    await this.findOne(taskId);

    return this.taskRepository.find({
      where: {
        parentTask: {
          id: taskId,
        },
      },
      relations: {
        assignee: true,
        project: true,
        labels: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async createSubtask(taskId: string, dto: CreateSubtaskDto, userId: string) {
    const parentTask = await this.findOne(taskId);

    const creator = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!creator) {
      throw new NotFoundException('User not found');
    }

    let assignee = creator;

    if (dto.assigneeId) {
      const selectedAssignee = await this.userRepository.findOne({
        where: {
          id: dto.assigneeId,
        },
      });

      if (!selectedAssignee) {
        throw new NotFoundException('Assignee not found');
      }

      assignee = selectedAssignee;
    }

    const subtask = this.taskRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.TODO,
      priority: dto.priority ?? TaskPriority.NO_PRIORITY,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      project: parentTask.project,
      assignee,
      parentTask,
      members: [creator],
    });

    const savedSubtask = await this.taskRepository.save(subtask);

    const createdSubtask = await this.findOne(savedSubtask.id);

    this.collaborationGateway.emitToTask(taskId, 'subtask.created', {
      subtaskId: createdSubtask.id,
    });

    return createdSubtask;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.findOne(id);

    if (dto.title !== undefined) {
      task.title = dto.title;
    }

    if (dto.description !== undefined) {
      task.description = dto.description ?? null;
    }

    if (dto.status !== undefined) {
      task.status = dto.status;
    }

    if (dto.priority !== undefined) {
      task.priority = dto.priority;
    }

    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    if (dto.projectId !== undefined) {
      const project = await this.projectRepository.findOne({
        where: {
          id: dto.projectId,
        },
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      task.project = project;
    }

    if (dto.assigneeId !== undefined) {
      if (dto.assigneeId === null) {
        task.assignee = null;
      } else {
        const assignee = await this.userRepository.findOne({
          where: {
            id: dto.assigneeId,
          },
        });

        if (!assignee) {
          throw new NotFoundException('Assignee not found');
        }

        task.assignee = assignee;
      }
    }

    const updatedTask = await this.taskRepository.save(task);

    return this.findOne(updatedTask.id);
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto) {
    const task = await this.findOne(id);

    task.status = dto.status;

    const updatedTask = await this.taskRepository.save(task);

    return this.findOne(updatedTask.id);
  }

  async updatePriority(id: string, dto: UpdateTaskPriorityDto) {
    const task = await this.findOne(id);

    task.priority = dto.priority;

    const updatedTask = await this.taskRepository.save(task);

    return this.findOne(updatedTask.id);
  }

  async updateAssignee(id: string, dto: UpdateTaskAssigneeDto) {
    const task = await this.findOne(id);

    if (!dto.assigneeId) {
      task.assignee = null;

      const updatedTask = await this.taskRepository.save(task);

      return this.findOne(updatedTask.id);
    }

    const user = await this.userRepository.findOne({
      where: {
        id: dto.assigneeId,
      },
    });

    if (!user) {
      throw new NotFoundException('Assignee not found');
    }

    task.assignee = user;

    const updatedTask = await this.taskRepository.save(task);

    return this.findOne(updatedTask.id);
  }

  async remove(id: string) {
    const task = await this.findOne(id);

    await this.taskRepository.remove(task);

    return {
      message: 'Task deleted successfully',
    };
  }
}
