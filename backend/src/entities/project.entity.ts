import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { Label } from './label.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column({ type: 'varchar', length: 255 })
  name: string | undefined;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | undefined;

  @Column({
    type: 'varchar',
    default: 'Medium',
  })
  priority: string | undefined;

  @Column({
    type: 'date',
    nullable: true,
  })
  dueDate: string | undefined;

  @ManyToOne(() => User, (user) => user.projects, {
    onDelete: 'CASCADE',
  })
  owner: User | undefined;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[] | undefined;

  @OneToMany(() => Label, (label) => label.project)
  labels: Label[] | undefined;

  @CreateDateColumn()
  createdAt: Date | undefined;

  @UpdateDateColumn()
  updatedAt: Date | undefined;
}
