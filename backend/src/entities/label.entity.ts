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
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  color: string | null;

  @ManyToMany(() => Task, (task) => task.labels)
  tasks: Task[];

  @ManyToOne(() => Project, (project) => project.labels, {
    onDelete: 'CASCADE',
  })
  project: Project;
}
