import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    const owner = await this.userRepository.findOne({
      where: { id: createProjectDto.ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    const project = this.projectRepository.create({
      name: createProjectDto.name,
      description: createProjectDto.description,
      priority: createProjectDto.priority,
      dueDate: createProjectDto.dueDate,
      owner,
    });

    return this.projectRepository.save(project);
  }

  findAll() {
    return this.projectRepository.find({
      relations: {
        owner: true,
      },
    });
  }

  async findOne(id: string) {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        tasks: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);

    Object.assign(project, updateProjectDto);

    return this.projectRepository.save(project);
  }

  async remove(id: string) {
    const project = await this.findOne(id);

    await this.projectRepository.remove(project);

    return {
      message: 'Project deleted successfully',
    };
  }

  async findByOwner(ownerId: string) {
    const owner = await this.userRepository.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    return this.projectRepository.find({
      where: {
        owner: {
          id: ownerId,
        },
      },
      relations: {
        owner: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
