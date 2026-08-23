import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Task } from './task.entity';
import { User } from './user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  content: string;

  @ManyToOne(() => Task, (task) => task.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'taskId',
  })
  task: Task;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'authorId',
  })
  author: User;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'parentCommentId',
  })
  parentComment: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
