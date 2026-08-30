import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';

import { Comment } from './comment.entity';
import { Project } from './project.entity';
import { User } from './user.entity';
import { Label } from './label.entity';

export enum TaskStatus {
  TODO = 'todo',
  DOING = 'doing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

export enum TaskPriority {
  NO_PRIORITY = 'no_priority',
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column({ type: 'text', nullable: false })
  title?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null | undefined;

  @Column({
    type: 'date',
    nullable: true,
  })
  dueDate: Date | null | undefined;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus | undefined;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.NO_PRIORITY,
  })
  priority: TaskPriority | undefined;

  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  assignee: User | null | undefined;

  @ManyToMany(() => User, (user) => user.memberTasks)
  @JoinTable({
    name: 'task_members',
    joinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  members: User[] | undefined;

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  project: Project | undefined;

  @ManyToOne(() => Task, (task) => task.subtasks, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentTask: Task | null | undefined;

  @OneToMany(() => Task, (task) => task.parentTask)
  subtasks: Task[] | undefined;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[] | undefined;

  @ManyToMany(() => Label, (label) => label.tasks, {
    cascade: false,
  })
  @JoinTable({
    name: 'task_labels',
    joinColumn: {
      name: 'task_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'label_id',
      referencedColumnName: 'id',
    },
  })
  labels: Label[] | undefined;

  @CreateDateColumn()
  createdAt: Date | undefined;

  @UpdateDateColumn()
  updatedAt: Date | undefined;
}
