import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Project } from './project.entity';
import { Task } from './task.entity';
import { Comment } from './comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  email: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  avatar: string | null;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  googleId: string | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  isGuest: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  title: string | null;

  @Column({
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  username: string | null;

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];

  @OneToMany(() => Task, (task) => task.assignee)
  tasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
