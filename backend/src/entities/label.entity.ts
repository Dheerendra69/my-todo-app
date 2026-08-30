import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Task } from './task.entity';
import { Project } from './project.entity';

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string | undefined;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  color: string | null | undefined;

  @ManyToMany(() => Task, (task) => task.labels)
  tasks: Task[] | undefined;

  @ManyToOne(() => Project, (project) => project.labels, {
    onDelete: 'CASCADE',
  })
  project: Project | undefined;
}
